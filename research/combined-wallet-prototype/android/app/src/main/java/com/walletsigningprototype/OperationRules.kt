package com.walletsigningprototype

enum class StepState { PLANNED, SIGNED, SUBMITTED, CONFIRMED, FINALIZED, UNKNOWN, FAILED }

data class OperationStep(
  val id: String,
  val accountIndex: Int,
  val batch: Int,
  val valueWei: String,
  val status: StepState = StepState.PLANNED,
  val rawTransaction: String? = null,
  val txHash: String? = null,
  val nonce: Long? = null,
)

object OperationRules {
  fun testSteps(): List<OperationStep> =
    (1..6).map { index ->
      OperationStep("batch-1-account-$index", index, 1, "0")
    } + (1..6).map { index ->
      OperationStep("batch-2-account-$index", index, 2, "1")
    }

  fun canSign(
    step: OperationStep,
    allSteps: List<OperationStep>,
    nowElapsed: Long,
    firstBatchConfirmedAt: Long,
    authorizedUntilElapsed: Long,
  ): Boolean {
    if (step.status != StepState.PLANNED || step.rawTransaction != null) return false
    if (nowElapsed >= authorizedUntilElapsed) return false
    if (step.batch == 1) return true
    if (step.batch != 2 || nowElapsed < firstBatchConfirmedAt + 60_000) return false
    return allSteps.filter { it.batch == 1 }.all {
      it.status == StepState.CONFIRMED || it.status == StepState.FINALIZED
    }
  }
}
