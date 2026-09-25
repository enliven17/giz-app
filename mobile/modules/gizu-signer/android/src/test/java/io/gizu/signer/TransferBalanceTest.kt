package io.gizu.signer

import org.junit.Assert.*
import org.junit.Test

class TransferBalanceTest {
  @Test fun zeroBalanceAndMissingFeesProduceFundingGuidance() {
    for (balance in listOf("0x0", "0x1", "0x5208")) {
      try { requireTransferBalance(balance, listOf("0x1"), "0x1"); fail("Insufficient balance accepted") }
      catch (failure: RpcFailure) { assertEquals(RpcFailureCode.INSUFFICIENT_FUNDS, failure.code) }
    }
    requireTransferBalance("0x5209", listOf("0x1"), "0x1")
  }
  @Test fun fundsMustCoverEveryTransferAndItsFee() {
    try { requireTransferBalance("0x5209", listOf("0x1", "0x1"), "0x1"); fail("Partial funding accepted") }
    catch (failure: RpcFailure) { assertEquals(RpcFailureCode.INSUFFICIENT_FUNDS, failure.code) }
    requireTransferBalance("0xa412", listOf("0x1", "0x1"), "0x1")
  }
  @Test fun malformedRpcQuantitiesAreNotMisreportedAsFundingFailures() {
    for (balance in listOf("-1", "0x-1", "0x", "0x00", "0xgg")) {
      try { requireTransferBalance(balance, listOf("0x1"), "0x1"); fail("Malformed balance accepted") }
      catch (_: IllegalArgumentException) { }
    }
  }
}
