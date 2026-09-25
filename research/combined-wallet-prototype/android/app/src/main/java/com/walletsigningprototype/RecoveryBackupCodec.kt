package com.walletsigningprototype

import java.nio.charset.StandardCharsets
import java.util.Base64
import javax.crypto.spec.SecretKeySpec
import org.json.JSONObject

/** The PRF wraps the existing wallet entropy and its fixed six-account derivation metadata. */
object RecoveryBackupCodec {
  private const val format = "wallet-prototype-prf-backup"
  private const val version = 1
  private const val maxSize = 64 * 1024
  private val indices = byteArrayOf(1, 2, 3, 4, 5, 6)

  fun encrypt(entropy: ByteArray, credential: StoredPasskey, rpId: String, prf: ByteArray): ByteArray {
    require(entropy.size == 32 && prf.size == 32)
    checkCredential(credential)
    val payload = byteArrayOf(version.toByte()) + entropy + indices
    val envelope = try {
      CryptoEnvelope.encrypt(SecretKeySpec(prf, "AES"), payload, aad(rpId, credential.credentialId))
    } finally { payload.fill(0) }
    val backup = JSONObject()
      .put("format", format)
      .put("version", version)
      .put("rpId", rpId)
      .put("credentialId", encode(credential.credentialId))
      .put("publicKeyX", encode(credential.publicKeyX))
      .put("publicKeyY", encode(credential.publicKeyY))
      .put("envelope", encode(envelope))
      .toString().toByteArray(StandardCharsets.UTF_8)
    require(backup.size <= maxSize)
    return backup
  }

  fun credential(backup: ByteArray, rpId: String): StoredPasskey {
    val json = parse(backup, rpId)
    val value = StoredPasskey(
      decode(json.getString("credentialId")),
      decode(json.getString("publicKeyX")),
      decode(json.getString("publicKeyY")),
    )
    checkCredential(value)
    return value
  }

  fun decrypt(backup: ByteArray, rpId: String, prf: ByteArray): ByteArray {
    require(prf.size == 32)
    val savedCredential = credential(backup, rpId)
    val envelope = decode(parse(backup, rpId).getString("envelope"))
    val payload = CryptoEnvelope.decrypt(
      SecretKeySpec(prf, "AES"), envelope, aad(rpId, savedCredential.credentialId),
    )
    try {
      require(payload.size == 1 + 32 + indices.size)
      require(payload[0].toInt() == version)
      require(payload.copyOfRange(33, payload.size).contentEquals(indices))
      return payload.copyOfRange(1, 33)
    } finally { payload.fill(0) }
  }

  private fun parse(backup: ByteArray, rpId: String): JSONObject {
    require(backup.isNotEmpty() && backup.size <= maxSize)
    val json = JSONObject(String(backup, StandardCharsets.UTF_8))
    require(json.getString("format") == format && json.getInt("version") == version)
    require(json.getString("rpId") == rpId) { "Backup belongs to another passkey domain" }
    return json
  }

  private fun checkCredential(value: StoredPasskey) {
    require(value.credentialId.isNotEmpty() && value.credentialId.size <= 1024)
    require(value.publicKeyX.size == 32 && value.publicKeyY.size == 32)
  }

  private fun aad(rpId: String, id: ByteArray): ByteArray =
    "wallet-prototype-recovery:v1:$rpId:${encode(id)}".toByteArray(StandardCharsets.UTF_8)

  private fun encode(bytes: ByteArray): String = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
  private fun decode(value: String): ByteArray = Base64.getUrlDecoder().decode(value)
}
