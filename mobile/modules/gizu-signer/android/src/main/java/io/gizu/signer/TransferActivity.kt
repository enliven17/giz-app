package io.gizu.signer

import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.StateListDrawable
import android.content.res.ColorStateList
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Build
import android.view.WindowManager
import android.view.View
import android.widget.*
import android.util.Base64
import androidx.credentials.*
import kotlinx.coroutines.*
import org.json.JSONArray
import org.json.JSONObject
import java.security.SecureRandom
import uniffi.gizu_signer_core.*

/** In-process handoff, never Intent extras or a JS approval method. */
internal object TransferHost {
  var pending: String? = null
  var token: String? = null
  var complete: ((String?) -> Unit)? = null
  var activity: TransferActivity? = null
  fun start(context: Activity, proposal: String, callback: (String?) -> Unit) {
    check(complete == null)
    validateTransferProposal(proposal)
    pending = proposal; complete = callback; token = java.util.UUID.randomUUID().toString()
    try { context.startActivity(Intent(context, TransferActivity::class.java).putExtra("operationToken", token)) }
    catch (_: Exception) { pending = null; token = null; complete = null; callback(null) }
  }
  fun cancel() {
    activity?.cancel()
    if (activity == null) finish(null)
  }
  fun finish(result: String?) {
    val callback = complete; complete = null; pending = null; token = null; activity = null
    callback?.invoke(result)
  }
}

internal class MonadRpc(private val progress: (String) -> Unit = {}) {
  private val transport = NativeRpcTransport()
  suspend fun call(method: String, params: JSONArray = JSONArray()): Any {
    val phase = when (method) {
      "eth_chainId" -> "Checking Monad testnet connection"
      "eth_gasPrice", "eth_maxPriorityFeePerGas" -> "Fetching current network fees"
      "eth_getTransactionCount" -> "Checking account nonce"
      "eth_getBalance" -> "Checking testnet MON balance"
      "eth_estimateGas" -> "Estimating transfer gas"
      "eth_getCode" -> "Checking account type"
      "eth_sendRawTransaction" -> "Submitting approved transfer"
      else -> "Checking transaction status"
    }
    progress(phase)
    android.util.Log.i("GizuTransfer", "RPC start: $method")
    try {
      val payload = JSONObject().put("jsonrpc", "2.0").put("id", 1).put("method", method).put("params", params).toString()
      val response = JSONObject(transport.post(payload))
      if (response.has("error")) {
        val message = response.optJSONObject("error")?.optString("message")?.lowercase().orEmpty()
        throw RpcFailure(if ("insufficient" in message && ("fund" in message || "balance" in message)) RpcFailureCode.INSUFFICIENT_FUNDS else RpcFailureCode.RPC)
      }
      check(response.getInt("id") == 1 && response.getString("jsonrpc") == "2.0")
      android.util.Log.i("GizuTransfer", "RPC complete: $method")
      return response.get("result")
    } catch (failure: Exception) {
      // Method names/codes only. Never log parameters, response bodies, credentials or errors.
      android.util.Log.w("GizuTransfer", "RPC failed: $method code=" + ((failure as? RpcFailure)?.code?.name ?: "INVALID_RESPONSE"))
      throw failure
    }
  }
  suspend fun text(method: String, vararg params: Any): String = call(method, JSONArray(params.toList())) as String
}

internal class TransferJournal(context: Context) {
  private val preferences = context.getSharedPreferences("gizu-native-transfers-v1", Context.MODE_PRIVATE)
  private fun read() = JSONArray(preferences.getString("entries", "[]"))
  private fun save(entries: JSONArray) { check(preferences.edit().putString("entries", entries.toString()).commit()) }
  fun unresolved(): Boolean { val entries = read(); return (0 until entries.length()).any { entries.getJSONObject(it).getString("status") !in listOf("finalized", "reverted") } }
  fun beforeBroadcast(operation: String, step: Int, tx: NativeSignedTransfer, intent: TransferIntent) {
    val entries = read(); check(entries.length() < 256)
    entries.put(JSONObject().put("operationId", operation).put("step", step).put("chainId", 10143)
      .put("from", tx.from).put("nonce", tx.nonce).put("intentHash", tx.intentHash)
      .put("transactionHash", tx.transactionHash).put("status", "unknown")
      .put("to", intent.to).put("valueWei", intent.valueHex.removePrefix("0x").toBigInteger(16).toString()))
    save(entries)
  }
  suspend fun reconcile(rpc: MonadRpc): String {
    val entries = read()
    check(rpc.text("eth_chainId") == "0x279f")
    for (i in 0 until entries.length()) {
      val entry = entries.getJSONObject(i)
      if (entry.getString("status") in listOf("finalized", "reverted")) continue
      val hash = entry.getString("transactionHash")
      val receipt = rpc.call("eth_getTransactionReceipt", JSONArray().put(hash))
      if (receipt is JSONObject) {
        check(receipt.getString("transactionHash").equals(hash, true))
        check(receipt.getString("from").equals(entry.getString("from"), true))
        val block = receipt.getString("blockNumber")
        val canonical = rpc.call("eth_getBlockByNumber", JSONArray().put(block).put(false)) as JSONObject
        val finalized = rpc.call("eth_getBlockByNumber", JSONArray().put("finalized").put(false)) as JSONObject
        val canonicalMatch = canonical.getString("hash").equals(receipt.getString("blockHash"), true)
        val finalEnough = finalized.getString("number").removePrefix("0x").toBigInteger(16) >= block.removePrefix("0x").toBigInteger(16)
        val status = receipt.getString("status")
        check(status == "0x0" || status == "0x1")
        entry.put("status", if (canonicalMatch && finalEnough) { if (status == "0x1") "finalized" else "reverted" } else "pending")
      } else {
        val tx = rpc.call("eth_getTransactionByHash", JSONArray().put(hash))
        entry.put("status", if (tx is JSONObject) "pending" else "unknown")
      }
    }
    save(entries); return entries.toString()
  }
  fun publicStatus(): String = read().toString()
}

/** Full-screen native review: no React views, WebView, exported Activity or mutable JS state. */
class TransferActivity : Activity() {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var operation: TransferOperation? = null
  private var providerPending = false
  private var finished = false
  private var approved = false
  private var foreground: CompletableDeferred<Unit>? = null
  private lateinit var root: LinearLayout
  private lateinit var journal: TransferJournal
  private var preparationStatus: TextView? = null
  private var expiry: Job? = null
  private val rpc = MonadRpc { phase -> preparationStatus?.text = "$phase…\nNo transaction has been signed." }
  private val operationId = random().joinToString("") { "%02x".format(it) }
  // Mirrors src/theme/colors.json; presentation only, never supplied by JavaScript.
  private val ink = Color.parseColor("#050706")
  private val surface = Color.parseColor("#0b100d")
  private val accent = Color.parseColor("#31c47e")
  private val foregroundColor = Color.parseColor("#dfe8e3")
  private val muted = Color.parseColor("#a7b2ab")
  private val border = Color.parseColor("#1d2821")
  private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
  private fun rounded(color: Int) = GradientDrawable().apply {
    setColor(color); cornerRadius = dp(20).toFloat(); setStroke(dp(1), border)
  }
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (savedInstanceState != null || TransferHost.pending == null || TransferHost.complete == null || intent.getStringExtra("operationToken") != TransferHost.token) { finished = true; finish(); return }
    TransferHost.activity = this; journal = TransferJournal(this)
    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    if (Build.VERSION.SDK_INT >= 31) window.setHideOverlayWindows(true)
    window.statusBarColor = ink; window.navigationBarColor = ink
    window.decorView.systemUiVisibility = 0
    root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL; setPadding(dp(24), dp(24), dp(24), dp(24))
      setBackgroundColor(ink); filterTouchesWhenObscured = true
      setOnApplyWindowInsetsListener { v, insets ->
        v.setPadding(dp(24) + insets.systemWindowInsetLeft, dp(16) + insets.systemWindowInsetTop,
          dp(24) + insets.systemWindowInsetRight, dp(16) + insets.systemWindowInsetBottom)
        insets
      }
    }
    setContentView(root)
    text("MONAD TESTNET · NATIVE APPROVAL", 13f)
    text("Review transfer", 32f)
    text("Unlock an existing test passkey to derive sender addresses and fetch current fees. Nothing is signed until you approve the final native review.")
    button("Unlock test passkey") {
      it.isEnabled = false
      scope.launch {
        try { unlockAndPrepare() }
        catch (failure: Exception) { showFailure(failure) }
      }
    }
    button("Cancel") { cancel() }
  }
  private fun text(value: String, size: Float = 17f) = TextView(this).also {
    it.text = value; it.textSize = size
    it.setTextColor(if (size >= 24f) foregroundColor else if (size == 13f) accent else muted)
    if (size >= 24f) it.typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
    it.setPadding(0, dp(8), 0, dp(12)); it.setLineSpacing(dp(3).toFloat(), 1f); root.addView(it)
  }
  private fun button(label: String, action: (Button) -> Unit) = Button(this).also { b ->
    val primary = label != "Cancel" && label != "Reject" && label != "Close"
    b.text = label; b.isAllCaps = false; b.textSize = 17f
    b.typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
    b.minHeight = dp(56); b.setPadding(dp(16), dp(14), dp(16), dp(14))
    b.backgroundTintList = null
    b.background = StateListDrawable().apply {
      addState(intArrayOf(-android.R.attr.state_enabled), rounded(surface))
      addState(intArrayOf(android.R.attr.state_pressed), rounded(border))
      addState(intArrayOf(), rounded(if (primary) accent else surface))
    }
    b.setTextColor(ColorStateList(arrayOf(intArrayOf(-android.R.attr.state_enabled), intArrayOf(android.R.attr.state_pressed), intArrayOf()),
      intArrayOf(muted, foregroundColor, if (primary) ink else foregroundColor)))
    b.filterTouchesWhenObscured = true; b.setOnClickListener { action(b) }
    root.addView(b, LinearLayout.LayoutParams(-1, -2).apply { topMargin = dp(12) })
  }
  private suspend fun unlockAndPrepare() {
    check(!journal.unresolved()) // Explicit refresh/reconciliation required before a fresh operation.
    providerPending = true
    val prf = try {
      withTimeout(120000) {
        val salt = "896d46ac4ac191885c46137439db7bb52fb05cff3ecd34af7cdae0a1e0c00db9".chunked(2).map { it.toInt(16).toByte() }.toByteArray()
        val request = JSONObject().put("challenge", b64(random())).put("rpId", "gizu.io").put("userVerification", "required")
          .put("extensions", JSONObject().put("prf", JSONObject().put("eval", JSONObject().put("first", b64(salt)))))
        val response = CredentialManager.create(this@TransferActivity).getCredential(this@TransferActivity,
          GetCredentialRequest(listOf(GetPublicKeyCredentialOption(request.toString()))))
        val credential = response.credential as PublicKeyCredential
        val json = JSONObject(credential.authenticationResponseJson)
        Base64.decode(json.getJSONObject("clientExtensionResults").getJSONObject("prf").getJSONObject("results").getString("first"), Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
      }
    } finally { providerPending = false }
    try {
      check(!finished)
      operation = TransferOperation(TransferHost.pending ?: error("cancelled"), prf)
    } finally { prf.fill(0) }
    // Start secret expiry immediately after the result, including any pending foreground transition.
    expiry = scope.launch { delay(120000); cancel() }
    if (!hasWindowFocus()) {
      foreground = CompletableDeferred()
      withTimeout(10000) { foreground!!.await() }
    }
    check(!finished && hasWindowFocus())
    root.removeAllViews()
    preparationStatus = text("Preparing exact transfers…")
    root.addView(ProgressBar(this))
    button("Cancel preparation") { cancel() }
    withTimeout(30_000) { prepareTransfers() }
  }
  private suspend fun prepareTransfers() {
    val op = operation ?: error("closed")
    val intents = op.intents()
    val chain = rpc.text("eth_chainId")
    val maxFee = rpc.text("eth_gasPrice")
    val priority = rpc.text("eth_maxPriorityFeePerGas")
    val nonces = mutableMapOf<String, String>()
    val balances = mutableMapOf<String, String>()
    val quotes = intents.map { intent ->
      val nonce = nonces[intent.from] ?: rpc.text("eth_getTransactionCount", intent.from, "pending").also { nonces[intent.from] = it }
      val balance = balances[intent.from] ?: rpc.text("eth_getBalance", intent.from, "pending").also { balances[intent.from] = it }
      requireTransferBalance(
        balance,
        intents.filter { it.from == intent.from }.map { it.valueHex },
        maxFee
      )
      val tx = JSONObject().put("from", intent.from).put("to", intent.to).put("value", intent.valueHex).put("data", "0x")
      val gas = rpc.call("eth_estimateGas", JSONArray().put(tx)) as String
      TransferQuote(chain, nonce, gas, maxFee, priority, balance,
        rpc.text("eth_getCode", intent.to, "pending"), rpc.text("eth_getCode", intent.from, "pending"))
    }
    check(!finished && hasWindowFocus())
    showReview(op.prepare(quotes), intents)
  }
  private fun showFailure(failure: Exception) {
    if (finished) return
    val wasPreparing = preparationStatus != null
    expiry?.cancel()
    operation?.invalidate(); operation?.destroy(); operation = null
    preparationStatus = null
    root.removeAllViews()
    text("Preparation stopped", 24f)
    val detail = when {
      failure is TimeoutCancellationException -> if (wasPreparing) "The network did not finish preparing within 30 seconds." else "The passkey or foreground wait timed out. Close and try again."
      failure is RpcFailure -> when (failure.code) {
        RpcFailureCode.INSUFFICIENT_FUNDS -> "This account needs more testnet MON to cover the amount and fees."
        RpcFailureCode.TIMEOUT -> "The Monad testnet request timed out. Check your connection and try again."
        RpcFailureCode.NETWORK -> "The phone could not reach the Monad testnet endpoint. Check mobile data or Wi-Fi."
        else -> "The Monad testnet endpoint rejected or returned an invalid response."
      }
      else -> "The transfer could not pass native preparation checks. Check the account, recipient and available testnet MON."
    }
    text("$detail No transaction was signed.")
    button("Close") { cancel() }
  }
  private fun showReview(review: String, intents: List<TransferIntent>) {
    preparationStatus = null
    root.removeAllViews()
    text("MONAD TESTNET · NATIVE APPROVAL", 13f)
    text("Confirm transfers", 28f)
    text("Review all details below to enable approval.", 15f)
    val scroll = ScrollView(this)
    val content = TextView(this).apply {
      text = review; textSize = 16f; setTextColor(foregroundColor)
      setPadding(dp(20), dp(20), dp(20), dp(20)); setLineSpacing(dp(5).toFloat(), 1f)
    }
    scroll.background = rounded(surface); scroll.isFillViewport = true
    scroll.addView(content); root.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f))
    val approve = button("Approve exact testnet transfers") { b ->
      if (approved || finished || !hasWindowFocus()) return@button
      approved = true; b.isEnabled = false
      scope.launch {
        try {
          operation!!.approve()
          execute(intents)
        } catch (_: Exception) { cancel() }
      }
    }
    approve.isEnabled = false
    fun enableIfRead() { approve.isEnabled = !approved && !scroll.canScrollVertically(1) }
    scroll.viewTreeObserver.addOnScrollChangedListener { enableIfRead() }
    scroll.post { enableIfRead() }
    button("Reject") { cancel() }
  }
  private suspend fun execute(intents: List<TransferIntent>) {
    for ((step, intent) in intents.withIndex()) {
      check(!finished && hasWindowFocus())
      val chain = rpc.text("eth_chainId")
      val nonce = rpc.text("eth_getTransactionCount", intent.from, "pending")
      val code = rpc.text("eth_getCode", intent.to, "pending")
      val senderCode = rpc.text("eth_getCode", intent.from, "pending")
      check(!finished && hasWindowFocus())
      val tx = operation!!.signNext(nonce, chain, code, senderCode)
      journal.beforeBroadcast(operationId, step, tx, intent)
      check(!finished && hasWindowFocus())
      // Even a network exception leaves the prewritten expected hash as unknown.
      val returned = rpc.text("eth_sendRawTransaction", tx.rawTransaction)
      check(returned.equals(tx.transactionHash, true))
      var status = journal.reconcile(rpc)
      for (attempt in 0 until 3) {
        if (!journal.unresolved()) break
        delay(1000); status = journal.reconcile(rpc)
      }
      val entries = JSONArray(status)
      val last = entries.getJSONObject(entries.length() - 1)
      if (last.getString("status") != "finalized") break
    }
    finishResult(journal.publicStatus())
  }
  override fun onWindowFocusChanged(hasFocus: Boolean) { super.onWindowFocusChanged(hasFocus); if (hasFocus) foreground?.complete(Unit) }
  override fun onStop() { super.onStop(); if (!providerPending && !finished) cancel() }
  @Deprecated("Activity back callback") override fun onBackPressed() { cancel() }
  override fun onDestroy() { if (!finished) cancel(); super.onDestroy() }
  fun cancel() { finishResult(null) }
  private fun finishResult(result: String?) {
    if (finished) return
    finished = true; operation?.invalidate(); operation?.destroy(); operation = null
    foreground?.cancel(); scope.cancel()
    TransferHost.finish(result); finish()
  }
  companion object {
    private fun random() = ByteArray(32).also { SecureRandom().nextBytes(it) }
    private fun b64(bytes: ByteArray) = Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
  }
}
