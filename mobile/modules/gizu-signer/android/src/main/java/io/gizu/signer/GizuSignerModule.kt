package io.gizu.signer

import android.app.AlertDialog
import android.util.Base64
import androidx.credentials.*
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import kotlinx.coroutines.*
import org.json.JSONArray
import org.json.JSONObject
import java.security.SecureRandom
import uniffi.gizu_signer_core.*

/** Fixed-message development probe; never accepts PRF, messages or payloads from JS. */
class GizuSignerModule : Module() {
  private var busy = false
  private var task: Job? = null
  private var dialog: AlertDialog? = null
  private var cancelPending: (() -> Unit)? = null
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private fun random() = ByteArray(32).also { SecureRandom().nextBytes(it) }
  private fun b64(value: ByteArray) = Base64.encodeToString(value, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
  private val salt = "896d46ac4ac191885c46137439db7bb52fb05cff3ecd34af7cdae0a1e0c00db9"
  override fun definition() = ModuleDefinition {
    Name("GizuSigner")
    Function("getCapabilities") {
      val debug = ((appContext.reactContext?.applicationInfo?.flags ?: 0) and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0
      mapOf("nativeTransfers" to (debug && android.os.Build.VERSION.SDK_INT >= 28), "fixedProbe" to (debug && android.os.Build.VERSION.SDK_INT >= 28))
    }
    AsyncFunction("executeOperation") { proposal: String, promise: Promise ->
      scope.launch {
        val activity = appContext.currentActivity
        if (busy || activity == null || android.os.Build.VERSION.SDK_INT < 28 ||
          (activity.applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) == 0) {
          promise.reject("UNAVAILABLE", "Native testnet operation unavailable", null); return@launch
        }
        try {
          busy = true
          TransferHost.start(activity, proposal) { result ->
            busy = false
            if (result == null) promise.reject("OPERATION_STOPPED", "Operation stopped. Refresh native status before retrying; submitted transfers cannot be undone.", null)
            else promise.resolve(result)
          }
        } catch (_: Exception) { busy = false; promise.reject("INVALID_OPERATION", "Native operation rejected", null) }
      }
    }
    AsyncFunction("getOperationStatus") { promise: Promise ->
      scope.launch {
        if (busy) { promise.reject("BUSY", "Native operation in progress", null); return@launch }
        val context = appContext.reactContext
        if (context == null) { promise.reject("UNAVAILABLE", "Native status unavailable", null); return@launch }
        busy = true
        try { promise.resolve(TransferJournal(context).reconcile(MonadRpc())) }
        catch (_: Exception) { promise.reject("RPC_UNAVAILABLE", "Cannot reconcile native status. Do not repeat uncertain transfers.", null) }
        finally { busy = false }
      }
    }
    Function("cancelOperation") { scope.launch { TransferHost.cancel() } }
    Function("lock") { scope.launch { TransferHost.cancel(); cancelPending?.invoke() } }
    AsyncFunction("openNativeProbe") { promise: Promise ->
      scope.launch {
        val activity = appContext.currentActivity
        if (busy || android.os.Build.VERSION.SDK_INT < 28 || activity == null || (activity.applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) == 0) {
          promise.reject("UNAVAILABLE", "Native development probe unavailable", null)
          return@launch
        }
        busy = true
        var finished = false
        var expiry: Job? = null
        fun finishError() { if (finished) return; finished = true; expiry?.cancel(); busy = false; cancelPending = null; dialog?.dismiss(); dialog = null; promise.reject("PROBE_FAILED", "Native probe cancelled, unsupported or failed. Open an existing credential after partial creation.", null) }
        cancelPending = { task?.cancel(); finishError() }
        expiry = scope.launch { delay(120_000); cancelPending?.invoke() }
        fun start(create: Boolean) {
          if (finished) return
          task = scope.launch {
            try {
              val proofs = withTimeout(120_000) {
                val manager = CredentialManager.create(activity)
                var createdId: String? = null
                if (create) {
                  val request = JSONObject().put("challenge", b64(random()))
                    .put("rp", JSONObject().put("id", "gizu.io").put("name", "Gizu"))
                    .put("user", JSONObject().put("id", b64(random())).put("name", "gizu-native-test").put("displayName", "Gizu native test"))
                    .put("pubKeyCredParams", JSONArray().put(JSONObject().put("type", "public-key").put("alg", -7)))
                    .put("authenticatorSelection", JSONObject().put("residentKey", "required").put("userVerification", "required"))
                    .put("attestation", "none")
                    .put("extensions", JSONObject().put("prf", JSONObject()))
                  // Registration may leave a credential on cancellation of the subsequent assertion.
                  val registration = manager.createCredential(activity, CreatePublicKeyCredentialRequest(request.toString())) as CreatePublicKeyCredentialResponse
                  createdId = JSONObject(registration.registrationResponseJson).getString("id")
                }
                val saltBytes = salt.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
                val request = JSONObject().put("challenge", b64(random())).put("rpId", "gizu.io")
                  .put("userVerification", "required")
                  .put("extensions", JSONObject().put("prf", JSONObject().put("eval", JSONObject().put("first", b64(saltBytes)))))
                createdId?.let { request.put("allowCredentials", JSONArray().put(JSONObject().put("type", "public-key").put("id", it))) }
                val response = manager.getCredential(activity, GetCredentialRequest(listOf(GetPublicKeyCredentialOption(request.toString()))))
                val credential = response.credential as? PublicKeyCredential ?: error("unsupported")
                // Provider JSON remains native. JVM strings cannot be reliably erased.
                val result = JSONObject(credential.authenticationResponseJson)
                val prf = Base64.decode(result.getJSONObject("clientExtensionResults").getJSONObject("prf").getJSONObject("results").getString("first"), Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
                try {
                  ensureActive()
                  if (activity.isFinishing || activity.isDestroyed || finished) error("not foreground")
                  // Only this private native path accepts secret bytes. No bridge export.
                  runNativeProbe(prf, random().joinToString("") { "%02x".format(it) })
                } finally { prf.fill(0) }
              }
              val publicResults = proofs.map { mapOf("accountIndex" to it.accountIndex.toInt(), "address" to it.address, "message" to it.message, "signature" to it.signatureHex) }
              if (finished) return@launch
              finished = true; expiry?.cancel(); busy = false; cancelPending = null; dialog = null
              promise.resolve(publicResults)
            } catch (_: Exception) { finishError() }
          }
        }
        dialog = AlertDialog.Builder(activity)
          .setTitle("Native compatibility test")
          .setMessage("Use an unfunded test passkey. Approve 16 fixed test signatures across accounts 0–15. No transactions, login or spending. Keys stay in native memory and are released after this test. Creation may require two prompts.")
          .setPositiveButton("Open existing") { _, _ -> start(false) }
          .setNeutralButton("Create test passkey") { _, _ -> start(true) }
          .setNegativeButton("Cancel") { _, _ -> finishError() }
          .setOnCancelListener { finishError() }.show()
      }
    }
    Function("cancelProbe") { scope.launch { cancelPending?.invoke() } }
    OnDestroy { scope.launch { TransferHost.cancel(); cancelPending?.invoke(); scope.cancel() } }
  }
}
