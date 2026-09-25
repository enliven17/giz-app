package com.walletsigningprototype

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class OperationRulesTest {
  @Test fun planHasTwelveTransfersAcrossSixAccounts() {
    val steps = OperationRules.testSteps()
    assertEquals(12, steps.size)
    assertEquals((1..6).toList(), steps.take(6).map { it.accountIndex })
    assertEquals((1..6).toList(), steps.drop(6).map { it.accountIndex })
    assertEquals(List(6) { "0" } + List(6) { "1" }, steps.map { it.valueWei })
    assertEquals(12, steps.map { it.id }.toSet().size)
  }

  @Test fun noSecondBatchBeforeDelayOrWithoutAuthorization() {
    val steps = OperationRules.testSteps().mapIndexed { index, step ->
      step.copy(status = if (index < 6) StepState.CONFIRMED else StepState.PLANNED)
    }
    assertFalse(OperationRules.canSign(steps[6], steps, 59_999, 0, 900_000))
    assertTrue(OperationRules.canSign(steps[6], steps, 60_000, 0, 900_000))
    assertFalse(OperationRules.canSign(steps[6], steps, 900_001, 0, 900_000))
  }

  @Test fun alreadySignedStepCannotBeSignedAgain() {
    val steps = OperationRules.testSteps().toMutableList()
    steps[0] = steps[0].copy(status = StepState.CONFIRMED)
    steps[1] = steps[1].copy(status = StepState.CONFIRMED)
    steps[2] = steps[2].copy(status = StepState.UNKNOWN, rawTransaction = "0xabc")
    assertFalse(OperationRules.canSign(steps[2], steps, 1_000, 0, 900_000))
    assertEquals(9, steps.count { it.status == StepState.PLANNED })
  }
}
