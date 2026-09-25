package com.walletsigningprototype

import android.content.Context
import android.app.KeyguardManager
import android.os.SystemClock
import android.util.Log
import java.math.BigInteger
import java.io.IOException
import java.security.SecureRandom
import java.util.Base64
import java.util.UUID
import java.util.concurrent.atomic.AtomicBoolean
import org.json.JSONArray
import org.json.JSONObject

data class WalletBackupMaterial(val entropy: ByteArray, val credential: StoredPasskey)

class WalletEngine(private val context: Context) {
  init { Log.i("WalletLifecycle", "engineCreate identity=${System.identityHashCode(this)}") }
  private val store = EncryptedWalletStore(context)
  private val signer: WalletSigner = WalletCoreSigner()
  private val rpc = RpcClient()
  private val random = SecureRandom()
  private val workerRunning = AtomicBoolean(false)
  private val appForeground = AtomicBoolean(true)
  private var sessionOperation: String? = null
  private var sessionUntilElapsed = 0L

  @Synchronized fun walletStatus(): String = try {
    when {
      store.load() == null -> "absent"
      else -> "ready"
    }
  } catch (_: Exception) { "recovery_required" }

  @Synchronized fun createWallet(credential: StoredPasskey): JSONArray {
    check(store.load() == null) { "Wallet already exists" }
    val entropy = ByteArray(32).also(random::nextBytes)
    try {
      return saveNewWallet(entropy, credential)
    } finally { entropy.fill(0) }
  }

  /** Native callers must clear the returned entropy after wrapping it. */
  @Synchronized fun backupMaterial(): WalletBackupMaterial {
    val state = requiredState()
    return WalletBackupMaterial(decode(state.getString("entropy")), credential())
  }

  /** Recovery starts a fresh operation history so old payments cannot be resubmitted. */
  @Synchronized fun recoverWallet(entropy: ByteArray, credential: StoredPasskey): JSONArray {
    check(walletStatus() != "ready") { "Wallet already exists" }
    return saveNewWallet(entropy, credential)
  }

  private fun saveNewWallet(entropy: ByteArray, credential: StoredPasskey): JSONArray {
    require(entropy.size == 32)
    val accounts = JSONArray()
    signer.addresses(entropy).forEachIndexed { position, address ->
      accounts.put(JSONObject().put("index", position + 1).put("address", address))
    }
    val state = JSONObject()
      .put("version", 1)
      .put("entropy", encode(entropy))
      .put("credential", JSONObject()
        .put("id", encode(credential.credentialId))
        .put("x", encode(credential.publicKeyX))
        .put("y", encode(credential.publicKeyY)))
      .put("accounts", accounts)
      .put("operations", JSONArray())
    store.save(state)
    return accounts
  }

  @Synchronized fun credential(): StoredPasskey {
    val data = requiredState().getJSONObject("credential")
    return StoredPasskey(decode(data.getString("id")), decode(data.getString("x")), decode(data.getString("y")))
  }

  @Synchronized fun publicAccounts(): JSONArray =
    store.load()?.getJSONArray("accounts") ?: JSONArray()

  @Synchronized fun prepare(): JSONObject {
    val state = requiredState()
    val operations = state.getJSONArray("operations")
    for (i in 0 until operations.length()) {
      val existing = operations.getJSONObject(i)
      if (existing.getString("status") !in listOf("completed", "cancelled", "failed")) {
        throw IllegalStateException("Finish or cancel the current operation first")
      }
    }
    val now = System.currentTimeMillis()
    val id = UUID.randomUUID().toString()
    val steps = JSONArray()
    OperationRules.testSteps().forEach { step ->
      steps.put(JSONObject()
        .put("id", step.id)
        .put("accountIndex", step.accountIndex)
        .put("batch", step.batch)
        .put("valueWei", step.valueWei)
        .put("status", "planned"))
    }
    val operation = JSONObject()
      .put("id", id).put("revision", 1).put("status", "prepared")
      .put("createdAt", now).put("deadline", now + 86_400_000)
      .put("firstBatchConfirmedAt", 0L).put("steps", steps)
    operations.put(operation)
    store.save(state)
    return view(operation)
  }

  @Synchronized fun operation(id: String): JSONObject {
    val state = requiredState()
    val op = find(state, id)
    reconcileReview(state, op)
    return view(op)
  }

  @Synchronized fun operations(): JSONArray {
    val all = store.load()?.getJSONArray("operations") ?: JSONArray()
    val result = JSONArray()
    for (i in all.length() - 1 downTo 0) result.put(view(all.getJSONObject(i)))
    return result
  }

  @Synchronized fun approvalDetails(id: String): Pair<Int, String> {
    val op = find(requiredState(), id)
    check(view(op).getString("status") in listOf("prepared", "needs_unlock"))
    check(System.currentTimeMillis() < op.getLong("deadline"))
    return op.getInt("revision") to if (view(op).getString("status") == "prepared") "start" else "resume"
  }

  @Synchronized fun grantSession(id: String): JSONObject {
    val state = requiredState()
    val op = find(state, id)
    check(view(op).getString("status") in listOf("prepared", "needs_unlock"))
    sessionOperation = id
    sessionUntilElapsed = SystemClock.elapsedRealtime() + 900_000
    Log.i("WalletLifecycle", "grantSession elapsed=${SystemClock.elapsedRealtime()} foreground=${appForeground.get()}")
    op.put("status", "running")
    op.put("revision", op.getInt("revision") + 1)
    store.save(state)
    return view(op)
  }

  @Synchronized fun start(id: String): JSONObject {
    val state = requiredState()
    val op = find(state, id)
    check(op.getString("status") in listOf("running", "waiting"))
    Log.i("WalletLifecycle", "start identity=${System.identityHashCode(this)} valid=${sessionValid(id)} workerRunning=${workerRunning.get()}")
    check(sessionValid(id)) { "New unlock required" }
    if (workerRunning.compareAndSet(false, true)) {
      Thread({
        try { execute(id) } finally { workerRunning.set(false) }
      }, "wallet-operation-worker").start()
    }
    return view(op)
  }

  @Synchronized fun cancel(id: String): JSONObject {
    val state = requiredState()
    val op = find(state, id)
    check(op.getString("status") in listOf("prepared", "needs_unlock"))
    op.put("status", "cancelled")
    store.save(state)
    return view(op)
  }

  @Synchronized fun evidence(id: String): String {
    val op = find(requiredState(), id)
    val counts = JSONObject()
    val steps = op.getJSONArray("steps")
    for (i in 0 until steps.length()) {
      val step = steps.getJSONObject(i)
      val status = step.getString("status")
      counts.put(status, counts.optInt(status) + 1)
    }
    return JSONObject()
      .put("operationId", id)
      .put("status", op.getString("status"))
      .put("counts", counts)
      .put("chainId", 31337)
      .put("stepCount", steps.length())
      .toString()
  }

  private fun execute(id: String) {
    while (true) {
      try {
        val sleep = synchronized(this) { advance(id) }
        if (sleep < 0) return
        Thread.sleep(sleep)
      } catch (_: InterruptedException) {
        return
      } catch (error: IOException) {
        Log.i("WalletLifecycle", "workerIo identity=${System.identityHashCode(this)} type=${error.javaClass.simpleName}")
        // A disconnected RPC does not change the signed transaction. Retry its saved bytes.
        Thread.sleep(1_000)
      } catch (error: Exception) {
        Log.e("WalletLifecycle", "workerError identity=${System.identityHashCode(this)} type=${error.javaClass.simpleName}")
        synchronized(this) {
          val state = requiredState()
          val op = find(state, id)
          if (op.getString("status") in listOf("running", "waiting")) {
            op.put("status", "needs_review")
            store.save(state)
          }
        }
        return
      }
    }
  }

  /** One durable transition per call. A signed raw transaction is saved before any RPC submission. */
  private fun advance(id: String): Long {
    val state = requiredState()
    val op = find(state, id)
    if (op.getString("status") !in listOf("running", "waiting")) return -1
    val now = System.currentTimeMillis()
    if (now < op.getLong("createdAt") || now >= op.getLong("deadline")) {
      op.put("status", "failed"); store.save(state); return -1
    }
    if (!appForeground.get()) return 300
    if (!sessionValid(id)) {
      Log.i("WalletLifecycle", "sessionInvalid match=${sessionOperation == id} timeValid=${SystemClock.elapsedRealtime() < sessionUntilElapsed} keyguardLocked=${(context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager).isKeyguardLocked} foreground=${appForeground.get()}")
      op.put("status", "needs_unlock"); store.save(state); return -1
    }
    check(rpc.chainId() == 31337L) { "Wrong chain" }
    val steps = op.getJSONArray("steps")
    val accounts = state.getJSONArray("accounts")
    var firstDone = true
    var allDone = true
    for (i in 0 until steps.length()) {
      val step = steps.getJSONObject(i)
      val status = step.getString("status")
      if (step.getInt("batch") == 1 && status != "confirmed") firstDone = false
      if (status != "confirmed") allDone = false
    }
    if (allDone) {
      op.put("status", "completed"); store.save(state); return -1
    }
    if (firstDone && op.getLong("firstBatchConfirmedAt") == 0L) {
      op.put("firstBatchConfirmedAt", now); store.save(state); return 1000
    }
    val gasPrice = rpc.gasPrice()
    check(gasPrice > BigInteger.ZERO && gasPrice <= BigInteger("10000000000"))
    check(gasPrice.multiply(BigInteger.valueOf(21_000L * 12)) <= BigInteger("3000000000000000"))
    for (i in 0 until steps.length()) {
      val step = steps.getJSONObject(i)
      if (step.getString("status") == "confirmed") continue
      if (step.getInt("batch") == 2 && (!firstDone || now < op.getLong("firstBatchConfirmedAt") + 60_000)) {
        op.put("status", "waiting"); store.save(state); return 1000
      }
      val index = step.getInt("accountIndex")
      val address = accounts.getJSONObject(index - 1).getString("address")
      val raw = step.optString("rawTransaction")
      val hash = step.optString("txHash")
      if (raw.isNotEmpty()) {
        val receipt = rpc.receipt(hash)
        if (receipt != null) {
          if (receipt.optString("status") != "0x1") {
            Log.i("WalletLifecycle", "needsReview reason=receiptStatus step=$i")
            op.put("status", "needs_review"); store.save(state); return -1
          }
          step.put("status", "confirmed")
          Log.i("WalletLifecycle", "confirmed identity=${System.identityHashCode(this)} step=$i")
          step.put("blockHash", receipt.optString("blockHash"))
          store.save(state)
          return 100
        }
        val latest = rpc.nonce(address, "latest")
        if (latest > step.getLong("nonce")) {
          Log.i("WalletLifecycle", "needsReview reason=nonceAdvanced step=$i")
          op.put("status", "needs_review"); store.save(state); return -1
        }
        try { rpc.broadcast(raw) } catch (e: Exception) {
          // A lost response can cause the same saved transaction to be submitted again.
          // Some RPCs report that replay as a nonce error even though it was mined.
          val mined = rpc.receipt(hash)
          if (mined != null) {
            if (mined.optString("status") != "0x1") {
              Log.i("WalletLifecycle", "needsReview reason=receiptStatusAfterBroadcast step=$i")
              op.put("status", "needs_review"); store.save(state); return -1
            }
            step.put("status", "confirmed")
            step.put("blockHash", mined.optString("blockHash"))
            Log.i("WalletLifecycle", "confirmedAfterBroadcastError identity=${System.identityHashCode(this)} step=$i")
            store.save(state)
            return 100
          }
          if (!e.message.orEmpty().contains("already known", ignoreCase = true)) throw e
        }
        step.put("status", "submitted")
        store.save(state)
        return 1000
      }
      val nonce = rpc.nonce(address, "pending")
      val entropy = decode(state.getString("entropy"))
      val signed = try {
        signer.signTransfer(
          entropy, index, nonce, address, BigInteger(step.getString("valueWei")), gasPrice,
        )
      } finally { entropy.fill(0) }
      step.put("nonce", nonce)
        .put("rawTransaction", signed.rawHex)
        .put("txHash", signed.txHash)
        .put("status", "signed")
      op.put("status", "running")
      store.save(state)
      Log.i("WalletLifecycle", "signed identity=${System.identityHashCode(this)} step=$i")
      return 100
    }
    return 1000
  }

  private fun sessionValid(id: String): Boolean =
    sessionOperation == id && SystemClock.elapsedRealtime() < sessionUntilElapsed &&
      !(context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager).isKeyguardLocked

  @Synchronized fun invalidateSession() {
    Log.i("WalletLifecycle", "invalidateSession elapsed=${SystemClock.elapsedRealtime()} foreground=${appForeground.get()}")
    sessionOperation = null
    sessionUntilElapsed = 0L
  }

  fun setForeground(foreground: Boolean) {
    appForeground.set(foreground)
    Log.i("WalletLifecycle", "setForeground=$foreground elapsed=${SystemClock.elapsedRealtime()}")
  }

  private fun reconcileReview(state: JSONObject, op: JSONObject) {
    if (op.getString("status") != "needs_review" || rpc.chainId() != 31337L) return
    val steps = op.getJSONArray("steps")
    var recovered = false
    for (i in 0 until steps.length()) {
      val step = steps.getJSONObject(i)
      if (step.getString("status") == "failed") return
      val raw = step.optString("rawTransaction")
      if (raw.isEmpty() || step.getString("status") == "confirmed") continue
      val receipt = rpc.receipt(step.optString("txHash")) ?: return
      if (receipt.optString("status") != "0x1") return
      step.put("status", "confirmed")
      step.put("blockHash", receipt.optString("blockHash"))
      recovered = true
    }
    if (recovered) {
      op.put("status", "needs_unlock")
      store.save(state)
    }
  }

  private fun requiredState(): JSONObject = store.load() ?: error("Wallet absent")

  private fun find(state: JSONObject, id: String): JSONObject {
    val operations = state.getJSONArray("operations")
    for (i in 0 until operations.length()) {
      val op = operations.getJSONObject(i)
      if (op.getString("id") == id) return op
    }
    error("Unknown operation")
  }

  private fun view(operation: JSONObject): JSONObject {
    val steps = JSONArray()
    val originals = operation.getJSONArray("steps")
    for (i in 0 until originals.length()) {
      val step = originals.getJSONObject(i)
      steps.put(JSONObject()
        .put("id", step.getString("id"))
        .put("accountIndex", step.getInt("accountIndex"))
        .put("status", step.getString("status"))
        .put("txHash", step.optString("txHash").ifEmpty { JSONObject.NULL })
        .put("errorCode", JSONObject.NULL))
    }
    var status = operation.getString("status")
    if (status in listOf("running", "waiting") && !sessionValid(operation.getString("id"))) {
      Log.i("WalletLifecycle", "viewNeedsUnlock identity=${System.identityHashCode(this)} match=${sessionOperation == operation.getString("id")} timeValid=${SystemClock.elapsedRealtime() < sessionUntilElapsed} keyguardLocked=${(context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager).isKeyguardLocked}")
      status = "needs_unlock"
    }
    val nextAction = when (status) {
      "prepared" -> "approve"
      "needs_unlock" -> "unlock"
      "waiting", "running" -> "wait"
      "needs_review" -> "review"
      else -> "none"
    }
    return JSONObject()
      .put("id", operation.getString("id"))
      .put("revision", operation.getInt("revision"))
      .put("status", status)
      .put("steps", steps)
      .put("nextAction", nextAction)
  }

  private fun encode(bytes: ByteArray): String = Base64.getEncoder().encodeToString(bytes)
  private fun decode(value: String): ByteArray = Base64.getDecoder().decode(value)
}
