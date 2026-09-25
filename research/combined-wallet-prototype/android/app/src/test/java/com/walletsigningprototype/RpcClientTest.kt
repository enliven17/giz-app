package com.walletsigningprototype

import java.io.IOException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class RpcClientTest {
  private val client = RpcClient()

  @Test fun treatsDroppedResponseAsRetryableIoFailure() {
    assertThrows(IOException::class.java) {
      client.decodeResponse("", "eth_sendRawTransaction")
    }
    assertThrows(IOException::class.java) {
      client.decodeResponse("{", "eth_sendRawTransaction")
    }
  }

  @Test fun parsesValidResponse() {
    assertEquals(
      "0x7a69",
      client.decodeResponse("""{"jsonrpc":"2.0","id":1,"result":"0x7a69"}""", "eth_chainId"),
    )
  }
}
