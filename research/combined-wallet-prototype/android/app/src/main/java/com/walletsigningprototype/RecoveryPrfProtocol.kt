package com.walletsigningprototype

import java.util.Base64
import org.json.JSONArray
import org.json.JSONObject

object RecoveryPrfProtocol {
  fun registrationOptions(rpId: String, challenge: ByteArray, userId: ByteArray, salt: ByteArray): JSONObject {
    require(salt.size == 32)
    return JSONObject()
      .put("challenge", encode(challenge))
      .put("rp", JSONObject().put("id", rpId).put("name", "Wallet Signing Prototype"))
      .put("user", JSONObject().put("id", encode(userId))
        .put("name", "test-wallet").put("displayName", "Test wallet"))
      .put("pubKeyCredParams", JSONArray().put(JSONObject().put("type", "public-key").put("alg", -7)))
      .put("authenticatorSelection", JSONObject()
        .put("residentKey", "required").put("userVerification", "required"))
      .put("attestation", "none")
      .put("timeout", 120_000)
      .put("extensions", prfExtension(salt))
  }

  fun assertionOptions(rpId: String, challenge: ByteArray, credentialId: ByteArray, salt: ByteArray): JSONObject {
    require(salt.size == 32)
    return JSONObject()
      .put("challenge", encode(challenge))
      .put("rpId", rpId)
      .put("allowCredentials", JSONArray().put(JSONObject()
        .put("type", "public-key").put("id", encode(credentialId))))
      .put("userVerification", "required")
      .put("timeout", 120_000)
      .put("extensions", prfExtension(salt))
  }

  fun prfOutput(responseJson: String): ByteArray {
    val result = JSONObject(responseJson).optJSONObject("clientExtensionResults")
      ?.optJSONObject("prf")?.optJSONObject("results")?.optString("first")
    require(!result.isNullOrEmpty()) { "PRF result unavailable" }
    val output = Base64.getUrlDecoder().decode(result)
    require(output.size == 32) { "PRF result must be 32 bytes" }
    return output
  }

  private fun prfExtension(salt: ByteArray): JSONObject = JSONObject().put("prf", JSONObject()
    .put("eval", JSONObject().put("first", encode(salt))))

  private fun encode(bytes: ByteArray): String = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
}
