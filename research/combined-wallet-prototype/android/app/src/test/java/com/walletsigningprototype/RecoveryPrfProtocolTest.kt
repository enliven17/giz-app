package com.walletsigningprototype

import java.util.Base64
import org.json.JSONObject
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class RecoveryPrfProtocolTest {
  private val salt = ByteArray(32) { it.toByte() }
  private val encodedSalt = Base64.getUrlEncoder().withoutPadding().encodeToString(salt)

  @Test fun registrationRequestsPrfWithTheChosenSalt() {
    val options = RecoveryPrfProtocol.registrationOptions("example.com", ByteArray(32), ByteArray(16), salt)
    val prf = options.getJSONObject("extensions").getJSONObject("prf")
    assertEquals(encodedSalt, prf.getJSONObject("eval").getString("first"))
  }

  @Test fun assertionPinsCredentialAndRequestsTheSamePrfSalt() {
    val credentialId = byteArrayOf(1, 2, 3)
    val options = RecoveryPrfProtocol.assertionOptions("example.com", ByteArray(32), credentialId, salt)
    assertEquals("AQID", options.getJSONArray("allowCredentials").getJSONObject(0).getString("id"))
    assertEquals(encodedSalt, options.getJSONObject("extensions").getJSONObject("prf")
      .getJSONObject("eval").getString("first"))
  }

  @Test fun acceptsOnlyA32BytePrfResult() {
    val value = ByteArray(32) { (it + 7).toByte() }
    val response = JSONObject().put("clientExtensionResults", JSONObject().put("prf", JSONObject()
      .put("results", JSONObject().put("first", Base64.getUrlEncoder().withoutPadding().encodeToString(value)))))
    assertArrayEquals(value, RecoveryPrfProtocol.prfOutput(response.toString()))
    assertThrows(IllegalArgumentException::class.java) {
      RecoveryPrfProtocol.prfOutput(JSONObject().put("clientExtensionResults", JSONObject()).toString())
    }
  }
}
