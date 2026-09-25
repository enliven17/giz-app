package com.walletsigningprototype

import java.nio.charset.StandardCharsets
import java.util.Base64
import org.json.JSONObject
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Test

class RecoveryBackupCodecTest {
  private val entropy = ByteArray(32) { it.toByte() }
  private val prf = ByteArray(32) { (it + 20).toByte() }
  private val credential = StoredPasskey(byteArrayOf(1, 2, 3), ByteArray(32) { 4 }, ByteArray(32) { 5 })
  private val rpId = "wallet.example.com"

  @Test fun restoresTheOriginalEntropyAndCredentialWithoutExposingWalletData() {
    val backup = RecoveryBackupCodec.encrypt(entropy, credential, rpId, prf)
    val json = JSONObject(String(backup, StandardCharsets.UTF_8))
    assertEquals(1, json.getInt("version"))
    assertFalse(String(backup, StandardCharsets.UTF_8).contains(Base64.getEncoder().encodeToString(entropy)))
    assertFalse(json.has("addresses"))
    val header = RecoveryBackupCodec.credential(backup, rpId)
    assertArrayEquals(credential.credentialId, header.credentialId)
    assertArrayEquals(entropy, RecoveryBackupCodec.decrypt(backup, rpId, prf))
  }

  @Test fun rejectsWrongKeyDomainAndCorruption() {
    val backup = RecoveryBackupCodec.encrypt(entropy, credential, rpId, prf)
    assertThrows(Exception::class.java) { RecoveryBackupCodec.decrypt(backup, rpId, ByteArray(32)) }
    assertThrows(Exception::class.java) { RecoveryBackupCodec.credential(backup, "other.example.com") }
    val changed = JSONObject(String(backup, StandardCharsets.UTF_8))
    changed.put("credentialId", "AQIDBA")
    assertThrows(Exception::class.java) {
      RecoveryBackupCodec.decrypt(changed.toString().toByteArray(), rpId, prf)
    }
  }
}
