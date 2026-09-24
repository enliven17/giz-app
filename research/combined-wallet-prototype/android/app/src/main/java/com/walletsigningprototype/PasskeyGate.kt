package com.walletsigningprototype

import android.app.Activity
import android.content.pm.PackageManager
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.PublicKeyCredential
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import org.json.JSONArray
import org.json.JSONObject

class PasskeyGate(private val activity: Activity) {
  private val manager = CredentialManager.create(activity)
  private val random = SecureRandom()
  private var pendingChallenge: ByteArray? = null
  private val rpId get() = BuildConfig.RP_ID
  private val recoverySalt = MessageDigest.getInstance("SHA-256")
    .digest("wallet-prototype:recovery-prf-v1".toByteArray())

  suspend fun register(): StoredPasskey {
    val challenge = ByteArray(32).also(random::nextBytes)
    val userId = ByteArray(16).also(random::nextBytes)
    val options = RecoveryPrfProtocol.registrationOptions(rpId, challenge, userId, recoverySalt)
    val result = manager.createCredential(
      activity,
      CreatePublicKeyCredentialRequest(requestJson = options.toString()),
    ) as CreatePublicKeyCredentialResponse
    return PasskeyVerifier.verifyRegistration(
      result.registrationResponseJson, challenge, rpId, expectedOrigin(),
    )
  }

  /** Fresh verified assertion for backup or recovery; never grants an operation session. */
  suspend fun recoveryPrf(credential: StoredPasskey): ByteArray {
    val challenge = ByteArray(32).also(random::nextBytes)
    val options = RecoveryPrfProtocol.assertionOptions(
      rpId, challenge, credential.credentialId, recoverySalt,
    )
    val response = (manager.getCredential(
      activity, GetCredentialRequest(listOf(GetPublicKeyCredentialOption(options.toString()))),
    ).credential as PublicKeyCredential).authenticationResponseJson
    PasskeyVerifier.verifyAssertion(response, credential, challenge, rpId, expectedOrigin())
    return RecoveryPrfProtocol.prfOutput(response)
  }

  suspend fun authorize(
    credential: StoredPasskey,
    operationId: String,
    revision: Int,
    action: String,
  ) {
    val nonce = ByteArray(32).also(random::nextBytes)
    val challenge = MessageDigest.getInstance("SHA-256").digest(
      "wallet-prototype:v1:$operationId:$revision:$action:".toByteArray() + nonce,
    )
    synchronized(this) {
      check(pendingChallenge == null) { "Authorization already pending" }
      pendingChallenge = challenge
    }
    try {
      val requestJson = JSONObject()
        .put("challenge", encode(challenge))
        .put("rpId", rpId)
        .put("allowCredentials", JSONArray().put(
          JSONObject().put("type", "public-key").put("id", encode(credential.credentialId)),
        ))
        .put("userVerification", "required")
        .put("timeout", 120_000)
      val result = manager.getCredential(
        activity,
        GetCredentialRequest(listOf(GetPublicKeyCredentialOption(requestJson.toString()))),
      ).credential as PublicKeyCredential
      synchronized(this) {
        check(pendingChallenge?.contentEquals(challenge) == true)
        pendingChallenge = null
      }
      PasskeyVerifier.verifyAssertion(
        result.authenticationResponseJson, credential, challenge, rpId, expectedOrigin(),
      )
    } finally {
      synchronized(this) { pendingChallenge = null }
    }
  }

  @Suppress("DEPRECATION")
  private fun expectedOrigin(): String {
    val info = activity.packageManager.getPackageInfo(
      activity.packageName,
      PackageManager.GET_SIGNING_CERTIFICATES,
    )
    val certificate = info.signingInfo?.apkContentsSigners?.singleOrNull()
      ?: throw IllegalStateException("Expected exactly one signing certificate")
    val hash = MessageDigest.getInstance("SHA-256").digest(certificate.toByteArray())
    return "android:apk-key-hash:${encode(hash)}"
  }

  private fun encode(bytes: ByteArray): String =
    Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
}
