package com.walletsigningprototype

import org.junit.Assert.assertEquals
import org.junit.Test

class AttemptDecisionTest {
  @Test fun uncertainBroadcastUsesTheSameSignedBytes() {
    val step = OperationRules.testSteps()[0].copy(
      status = StepState.UNKNOWN,
      nonce = 4,
      rawTransaction = "0x02abcd",
      txHash = "0x1234",
    )
    assertEquals(AttemptAction.REBROADCAST_SAME_BYTES, AttemptDecision.decide(step, 4, false, true))
  }

  @Test fun consumedUnknownNonceNeedsReview() {
    val step = OperationRules.testSteps()[0].copy(
      status = StepState.UNKNOWN,
      nonce = 4,
      rawTransaction = "0x02abcd",
      txHash = "0x1234",
    )
    assertEquals(AttemptAction.REVIEW, AttemptDecision.decide(step, 5, false, true))
  }

  @Test fun plannedStepRequiresAuthorization() {
    val step = OperationRules.testSteps()[0]
    assertEquals(AttemptAction.WAIT, AttemptDecision.decide(step, 0, false, false))
    assertEquals(AttemptAction.SIGN, AttemptDecision.decide(step, 0, false, true))
  }
}
