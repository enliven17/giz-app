package com.walletsigningprototype

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.AtomicFile
import java.io.File
import java.security.KeyStore
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import org.json.JSONObject

class EncryptedWalletStore(context: Context) {
  private val file = AtomicFile(File(context.noBackupFilesDir, "wallet-prototype-state-v1.enc"))
  private val alias = "wallet-prototype-aes-v1"
  private val aad = "wallet-prototype-state:v1".toByteArray(Charsets.UTF_8)

  @Synchronized fun load(): JSONObject? {
    if (!file.baseFile.exists()) return null
    val clear = CryptoEnvelope.decrypt(key(), file.readFully(), aad)
    return try {
      JSONObject(String(clear, Charsets.UTF_8))
    } finally {
      clear.fill(0)
    }
  }

  @Synchronized fun save(state: JSONObject) {
    val clear = state.toString().toByteArray(Charsets.UTF_8)
    val encrypted = try {
      CryptoEnvelope.encrypt(key(), clear, aad)
    } finally {
      clear.fill(0)
    }
    val stream = file.startWrite()
    try {
      stream.write(encrypted)
      file.finishWrite(stream)
    } catch (error: Exception) {
      file.failWrite(stream)
      throw error
    }
  }

  private fun key(): SecretKey {
    val store = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    val existing = store.getKey(alias, null)
    if (existing is SecretKey) return existing
    val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
    generator.init(
      KeyGenParameterSpec.Builder(
        alias,
        KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
      )
        .setKeySize(256)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setRandomizedEncryptionRequired(true)
        .setUserAuthenticationRequired(false)
        .build(),
    )
    return generator.generateKey()
  }
}
