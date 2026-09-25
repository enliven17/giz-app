package io.gizu.storedwallet

import android.app.Activity
import android.app.AlertDialog
import android.app.KeyguardManager
import android.content.Context
import android.content.pm.ApplicationInfo
import android.os.Build
import android.view.WindowManager
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import java.security.SecureRandom
import java.util.UUID
import kotlin.coroutines.resume
import uniffi.gizu_stored_signer_core.deriveAccountAddresses

/** Wallet access requires a verified native backup; exact transfer signing stays native. */
class GizuStoredSignerModule : Module() {
  companion object { private val ceremony = Mutex() }
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var task: Job? = null
  private var dialog: AlertDialog? = null
  private var awaitingProvider = false
  private var foreground = true

  private fun eligible(activity: Activity?) = activity != null && Build.VERSION.SDK_INT >= 28 &&
    (activity.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0

  private fun foreground(activity: Activity) {
    check(foreground && !activity.isFinishing && !activity.isDestroyed && activity.hasWindowFocus())
    check(!(activity.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager).isKeyguardLocked)
  }

  private suspend fun confirm(activity: Activity, create: Boolean) = suspendCancellableCoroutine<Unit> { continuation ->
    val alert = AlertDialog.Builder(activity)
      .setTitle(if (create) "Create Gizu testnet wallet" else "Open Gizu testnet wallet")
      .setMessage(if (create) "Create a passkey and a new wallet stored encrypted on this phone. A verified backup is required before this wallet can be used."
        else "Confirm your passkey to check this wallet. This does not authorize transfers.")
      .setPositiveButton("Continue") { _, _ -> if (continuation.isActive) continuation.resume(Unit) }
      .setNegativeButton("Cancel") { _, _ -> continuation.cancel() }
      .setOnCancelListener { continuation.cancel() }.create()
    dialog = alert
    alert.window?.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    if (Build.VERSION.SDK_INT >= 31) alert.window?.setHideOverlayWindows(true)
    alert.show()
    alert.getButton(AlertDialog.BUTTON_POSITIVE).filterTouchesWhenObscured = true
    continuation.invokeOnCancellation { scope.launch { alert.dismiss() } }
  }

  private fun run(promise: Promise, wait: Boolean = false, block: suspend (Activity, WalletStore) -> Any) {
    scope.launch {
      val activity = appContext.currentActivity
      if (!eligible(activity)) { promise.reject("UNAVAILABLE", "Android development wallet unavailable.", null); return@launch }
      if (wait) ceremony.lock()
      if (!wait && !ceremony.tryLock()) { promise.reject("BUSY", "A native wallet operation is already in progress.", null); return@launch }
      task = coroutineContext[Job]
      try {
        foreground(activity!!)
        val result = withTimeout(120000) { block(activity, walletStore(activity.applicationContext)) }
        currentCoroutineContext().ensureActive()
        foreground(activity)
        promise.resolve(result)
      } catch (_: CancellationException) {
        promise.reject("CANCELLED", "Wallet operation cancelled or expired. Check wallet state before retrying creation.", null)
      } catch (_: Exception) {
        promise.reject("WALLET_FAILED", "Wallet operation failed. Check wallet state; an existing wallet must not be overwritten.", null)
      } finally {
        dialog?.dismiss(); dialog = null; awaitingProvider = false; task = null; ceremony.unlock()
      }
    }
  }

  private suspend fun <T> provider(activity: Activity, action: suspend () -> T): T {
    withTimeout(10000) { while (foreground && !activity.hasWindowFocus()) delay(50) }
    foreground(activity)
    awaitingProvider = true
    try {
      val result = action()
      // System credential UI may temporarily take focus. A locked/background app cannot consume results.
      withTimeout(10000) { while (!foreground || !activity.hasWindowFocus()) { delay(50) } }
      foreground(activity)
      return result
    } finally { awaitingProvider = false }
  }

  override fun definition() = ModuleDefinition {
    Name("GizuStoredSigner")
    AsyncFunction("getCapabilities") { promise: Promise ->
      promise.resolve(mapOf("contractVersion" to 1, "available" to eligible(appContext.currentActivity), "walletStorage" to eligible(appContext.currentActivity),
        "backup" to eligible(appContext.currentActivity), "transfers" to eligible(appContext.currentActivity)))
    }
    AsyncFunction("getWalletState") { promise: Promise -> run(promise) { _, store ->
      withContext(Dispatchers.IO) { publicState(store) }
    } }
    AsyncFunction("createWallet") { promise: Promise -> run(promise) { activity, store ->
      check(withContext(Dispatchers.IO) { !store.exists() })
      confirm(activity, true)
      val credential = provider(activity) { PasskeyGate(activity).register() }
      currentCoroutineContext().ensureActive()
      // No entropy is generated or held during the system credential ceremony.
      withContext(Dispatchers.IO) {
        val entropy = ByteArray(32).also { SecureRandom().nextBytes(it) }
        try {
          WalletRecord(UUID.randomUUID().toString(), credential, entropy).use { record ->
            // Verify the native core is available before persisting; addresses remain hidden until backup.
            check(deriveAccountAddresses(entropy).size == 16)
            currentCoroutineContext().ensureActive()
            store.create(record)
            record.publicState()
          }
        } finally { entropy.fill(0) }
      }
    } }
    AsyncFunction("openWallet") { promise: Promise -> run(promise) { activity, store ->
      val state = withContext(Dispatchers.IO) { store.state() }
      if (state["status"] == "absent" || state["status"] == "recoveryRequired") state
      else {
        val identity = withContext(Dispatchers.IO) { store.load().use { it.id to it.credential } }
        confirm(activity, false)
        provider(activity) { PasskeyGate(activity).authorize(identity.second, identity.first) }
        currentCoroutineContext().ensureActive()
        withContext(Dispatchers.IO) { store.load().use {
          check(it.id == identity.first)
          project(it)
        } }
      }
    } }
    AsyncFunction("backupWallet") { promise: Promise -> run(promise) { activity, store ->
      check(withContext(Dispatchers.IO) { store.state()["status"] in listOf("backupRequired", "ready") })
      provider(activity) { BackupHost.open(activity, false) }
      withContext(Dispatchers.IO) { publicState(store) }
    } }
    AsyncFunction("restoreWallet") { promise: Promise -> run(promise) { activity, store ->
      check(withContext(Dispatchers.IO) { store.state()["status"] in listOf("absent", "recoveryRequired") })
      provider(activity) { BackupHost.open(activity, true) }
      withContext(Dispatchers.IO) { publicState(store) }
    } }
    AsyncFunction("executeOperation") { proposal: Map<String, Any?>, promise: Promise -> run(promise) { activity,store ->
      val journal=store.load().use { operationJournal(activity,it) }
      reconcileOperations(journal,MonadRpc())
      val operation=store.load().use { createOperation(journal,it,proposal) }
      provider(activity) { TransferHost.open(activity,operation.getString("operationId"),operation.getInt("revision")) }
      journal.public(journal.get(operation.getString("operationId")))
    } }
    AsyncFunction("listOperations") { promise: Promise -> run(promise) { activity,store ->
      val journal=store.load().use { operationJournal(activity,it) }
      reconcileOperations(journal,MonadRpc())
      journal.all().map { journal.public(it) }
    } }
    AsyncFunction("getOperationStatus") { id: String, promise: Promise -> run(promise) { activity,store ->
      val journal=store.load().use { operationJournal(activity,it) }
      reconcileOperations(journal,MonadRpc()); journal.public(journal.get(id))
    } }
    AsyncFunction("resumeOperation") { id: String, revision: Int, promise: Promise -> run(promise) { activity,store ->
      val journal=store.load().use { operationJournal(activity,it) }
      check(journal.get(id).getInt("revision") == revision)
      provider(activity) { TransferHost.open(activity,id,revision) }
      journal.public(journal.get(id))
    } }
    AsyncFunction("cancelOperation") { id: String, promise: Promise ->
      scope.launch {
        if (TransferHost.id == id) task?.cancel()
        run(promise,wait=true) { activity,store ->
          val journal=store.load().use { operationJournal(activity,it) }
          journal.public(journal.cancel(id))
        }
      }
    }
    Function("lock") { scope.launch { task?.cancel() } }
    OnActivityEntersForeground { foreground = true }
    OnActivityEntersBackground {
      foreground = false
      if (!awaitingProvider) task?.cancel()
    }
    OnDestroy { task?.cancel(); dialog?.dismiss(); scope.cancel() }
  }
  private fun publicState(store: WalletStore): Map<String, Any> {
    val state = store.state()
    return if (state["status"] == "ready") store.load().use { project(it) } else state
  }
  private fun project(record: WalletRecord): Map<String, Any> = if (!record.verified) record.publicState()
    else record.publicState() + ("accounts" to deriveAccountAddresses(record.entropy).mapIndexed { index, address ->
      mapOf("accountIndex" to index, "address" to address, "chainId" to 10143)
    })
}
