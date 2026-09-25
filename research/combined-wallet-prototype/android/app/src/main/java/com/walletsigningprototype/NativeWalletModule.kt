package com.walletsigningprototype

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import kotlin.coroutines.resume

@ReactModule(name = NativeWalletSpec.NAME)
class NativeWalletModule(private val context: ReactApplicationContext) :
  NativeWalletSpec(context), LifecycleEventListener {
  private val engine = WalletEngine(context)
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
  private val lifecycleHandler = Handler(Looper.getMainLooper())
  private var pendingBackgroundCheck: Runnable? = null

  init {
    Log.i("WalletLifecycle", "moduleCreate identity=${System.identityHashCode(this)}")
    context.addLifecycleEventListener(this)
  }

  override fun getWalletStatus(promise: Promise) = task(promise) { engine.walletStatus() }
  override fun createTestWallet(promise: Promise) = task(promise) {
    check(engine.walletStatus() == "absent")
    val credential = PasskeyGate(activity()).register()
    withContext(Dispatchers.IO) { engine.createWallet(credential) }
  }
  override fun openRecoveryScreen(promise: Promise) = task(promise) {
    activity().startActivity(Intent(activity(), RecoveryActivity::class.java))
    null
  }
  override fun getPublicAccounts(promise: Promise) = task(promise) {
    withContext(Dispatchers.IO) { engine.publicAccounts() }
  }
  override fun prepareTestOperation(promise: Promise) = task(promise) {
    withContext(Dispatchers.IO) { engine.prepare() }
  }
  override fun authorizeOperation(operationId: String, promise: Promise) = task(promise) {
    val (revision, action) = withContext(Dispatchers.IO) { engine.approvalDetails(operationId) }
    confirm(activity(), action)
    val credential = withContext(Dispatchers.IO) { engine.credential() }
    PasskeyGate(activity()).authorize(credential, operationId, revision, action)
    withContext(Dispatchers.IO) { engine.grantSession(operationId) }
  }
  override fun runOperation(operationId: String, promise: Promise) = task(promise) {
    withContext(Dispatchers.IO) { engine.start(operationId) }
  }
  override fun getOperation(operationId: String, promise: Promise) = task(promise) {
    withContext(Dispatchers.IO) { engine.operation(operationId) }
  }
  override fun listOperations(promise: Promise) = task(promise) {
    withContext(Dispatchers.IO) { engine.operations() }
  }
  override fun cancelOperation(operationId: String, promise: Promise) = task(promise) {
    withContext(Dispatchers.IO) { engine.cancel(operationId) }
  }
  override fun exportRedactedEvidence(operationId: String, promise: Promise) = task(promise) {
    withContext(Dispatchers.IO) { engine.evidence(operationId) }
  }

  override fun onHostResume() {
    Log.i("WalletLifecycle", "onHostResume elapsed=${SystemClock.elapsedRealtime()}")
    pendingBackgroundCheck?.let(lifecycleHandler::removeCallbacks)
    pendingBackgroundCheck = null
    engine.setForeground(true)
  }
  override fun onHostPause() {
    Log.i("WalletLifecycle", "onHostPause elapsed=${SystemClock.elapsedRealtime()}")
    engine.setForeground(false)
    pendingBackgroundCheck?.let(lifecycleHandler::removeCallbacks)
    val check = Runnable {
      Log.i("WalletLifecycle", "backgroundCheck focus=${getCurrentActivity()?.window?.decorView?.hasWindowFocus()} elapsed=${SystemClock.elapsedRealtime()}")
      if (getCurrentActivity()?.window?.decorView?.hasWindowFocus() == true) {
        engine.setForeground(true)
      } else {
        engine.invalidateSession()
      }
      pendingBackgroundCheck = null
    }
    pendingBackgroundCheck = check
    lifecycleHandler.postDelayed(check, 30_000)
  }
  override fun onHostDestroy() { engine.invalidateSession() }

  private fun activity(): Activity = getCurrentActivity() ?: error("Activity unavailable")

  private suspend fun confirm(activity: Activity, action: String) =
    suspendCancellableCoroutine<Unit> { continuation ->
      val message = "Chain 31337 · six owned accounts · 12 transfers to self " +
        "(six zero wei, six one wei). Maximum value 6 wei, gas price 10 gwei, " +
        "gas per transfer 21000, total gas cost 0.003 ETH. " +
        "The second six transfers begin at least 60 seconds after the first six confirm. " +
        "Authorization lasts 15 minutes; operation deadline is 24 hours."
      val dialog = AlertDialog.Builder(activity)
        .setTitle(if (action == "start") "Confirm test intent" else "Resume test intent")
        .setMessage(message)
        .setNegativeButton("Cancel") { _, _ ->
          if (continuation.isActive) continuation.cancel()
        }
        .setPositiveButton("Confirm") { _, _ ->
          if (continuation.isActive) continuation.resume(Unit)
        }
        .create()
      continuation.invokeOnCancellation { dialog.dismiss() }
      dialog.show()
    }

  private fun task(promise: Promise, work: suspend () -> Any?) {
    scope.launch {
      try { promise.resolve(toReact(work())) }
      catch (error: Exception) { promise.reject("WALLET_ERROR", error.message ?: error.javaClass.simpleName) }
    }
  }

  private fun toReact(value: Any?): Any? = when (value) {
    is JSONObject -> map(value)
    is JSONArray -> array(value)
    else -> value
  }

  private fun map(json: JSONObject): WritableMap {
    val result = Arguments.createMap()
    for (key in json.keys()) {
      when (val value = json.get(key)) {
        JSONObject.NULL -> result.putNull(key)
        is JSONObject -> result.putMap(key, map(value))
        is JSONArray -> result.putArray(key, array(value))
        is Boolean -> result.putBoolean(key, value)
        is Int -> result.putInt(key, value)
        is Number -> result.putDouble(key, value.toDouble())
        else -> result.putString(key, value.toString())
      }
    }
    return result
  }

  private fun array(json: JSONArray): WritableArray {
    val result = Arguments.createArray()
    for (i in 0 until json.length()) {
      when (val value = json.get(i)) {
        JSONObject.NULL -> result.pushNull()
        is JSONObject -> result.pushMap(map(value))
        is JSONArray -> result.pushArray(array(value))
        is Boolean -> result.pushBoolean(value)
        is Int -> result.pushInt(value)
        is Number -> result.pushDouble(value.toDouble())
        else -> result.pushString(value.toString())
      }
    }
    return result
  }
}
