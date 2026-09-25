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

/** Phase 2: create/open only. Backup-required wallets never become app sessions. */
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
      .setMessage(if (create) "Create a passkey and a new wallet stored encrypted on this phone. A verified backup is required before this wallet can be used. Backup setup is not available in this build."
        else "Confirm your passkey to check this wallet. This does not authorize transfers. Backup setup is not available in this build.")
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

  private fun run(promise: Promise, block: suspend (Activity, WalletStore) -> Map<String, Any>) {
    scope.launch {
      val activity = appContext.currentActivity
      if (!eligible(activity)) { promise.reject("UNAVAILABLE", "Android development wallet unavailable.", null); return@launch }
      if (!ceremony.tryLock()) { promise.reject("BUSY", "A native wallet operation is already in progress.", null); return@launch }
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
      promise.resolve(mapOf("contractVersion" to 1, "available" to false,
        "reason" to "notImplemented", "walletStorage" to eligible(appContext.currentActivity),
        "backup" to false, "transfers" to false))
    }
    AsyncFunction("getWalletState") { promise: Promise -> run(promise) { _, store ->
      withContext(Dispatchers.IO) { store.state() }
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
          it.publicState()
        } }
      }
    } }
    // Later phases supply these ceremonies. Never fake ready state or transaction success.
    AsyncFunction("backupWallet") { promise: Promise -> unavailable(promise) }
    AsyncFunction("restoreWallet") { promise: Promise -> unavailable(promise) }
    Function("lock") { scope.launch { task?.cancel() } }
    OnActivityEntersForeground { foreground = true }
    OnActivityEntersBackground {
      foreground = false
      if (!awaitingProvider) task?.cancel()
    }
    OnDestroy { task?.cancel(); dialog?.dismiss(); scope.cancel() }
  }
  private fun unavailable(promise: Promise) = promise.reject("NOT_IMPLEMENTED", "Verified backup and recovery are not implemented yet.", null)
}
