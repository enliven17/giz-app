package com.walletsigningprototype

enum class AttemptAction { SIGN, REBROADCAST_SAME_BYTES, WAIT, REVIEW, DONE }

object AttemptDecision {
  fun decide(
    step: OperationStep,
    latestChainNonce: Long,
    receiptKnown: Boolean,
    authorized: Boolean,
  ): AttemptAction {
    if (step.status == StepState.CONFIRMED || step.status == StepState.FINALIZED) {
      return AttemptAction.DONE
    }
    if (step.status == StepState.FAILED) return AttemptAction.REVIEW
    if (receiptKnown) return AttemptAction.DONE
    if (step.rawTransaction != null) {
      val nonce = step.nonce ?: return AttemptAction.REVIEW
      if (step.txHash == null || latestChainNonce > nonce) return AttemptAction.REVIEW
      return AttemptAction.REBROADCAST_SAME_BYTES
    }
    if (step.status != StepState.PLANNED) return AttemptAction.REVIEW
    return if (authorized) AttemptAction.SIGN else AttemptAction.WAIT
  }
}
