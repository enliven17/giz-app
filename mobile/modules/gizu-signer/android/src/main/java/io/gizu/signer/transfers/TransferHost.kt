package io.gizu.signer

import android.app.Activity
import android.content.Intent
import uniffi.gizu_signer_core.validateTransferProposal

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

