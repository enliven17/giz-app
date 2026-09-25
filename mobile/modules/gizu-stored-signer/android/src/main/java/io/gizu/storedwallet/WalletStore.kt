package io.gizu.storedwallet

import java.io.*
import java.util.UUID
import javax.crypto.SecretKey

/** Native-only model; deliberately not a data class (no secret-bearing toString/copy). */
internal class WalletRecord(
  val id: String, val credential: StoredPasskey, val entropy: ByteArray,
) : AutoCloseable {
  init {
    UUID.fromString(id)
    require(entropy.size == 32)
    require(credential.credentialId.size in 1..1024)
    require(credential.publicKeyX.size == 32 && credential.publicKeyY.size == 32)
  }
  override fun close() { entropy.fill(0) }
  fun publicState(): Map<String, Any> = mapOf("status" to "backupRequired", "walletId" to id)
}
internal interface WalletFile {
  fun exists(): Boolean
  fun read(): ByteArray
  fun write(bytes: ByteArray)
}
internal interface WalletKeys {
  fun existing(): SecretKey?
  fun create(): SecretKey
}
internal class WalletStore(private val file: WalletFile, private val keys: WalletKeys) {
  private val aad = "io.gizu.storedwallet.v1:wallet:gizu.io:gizu-stored-evm-v1".toByteArray()
  fun exists() = file.exists()
  fun state(): Map<String, Any> = try {
    if (!exists()) mapOf("status" to "absent") else load().use { it.publicState() }
  } catch (_: Exception) { mapOf("status" to "recoveryRequired") }

  fun load(): WalletRecord {
    check(exists())
    // Never generate a new key when existing data cannot be decrypted.
    val key = keys.existing() ?: error("Missing storage key")
    val encrypted = file.read()
    require(encrypted.size in 1..8192)
    val clear = CryptoEnvelope.decrypt(key, encrypted, aad)
    try {
      DataInputStream(ByteArrayInputStream(clear)).use { input ->
        require(input.readInt() == 1)
        val id = input.readUTF()
        val length = input.readInt(); require(length in 1..1024)
        val credential = StoredPasskey(ByteArray(length).also(input::readFully),
          ByteArray(32).also(input::readFully), ByteArray(32).also(input::readFully))
        val entropy = ByteArray(32)
        try {
          input.readFully(entropy)
          require(input.available() == 0)
          return WalletRecord(id, credential, entropy)
        } catch (error: Exception) { entropy.fill(0); throw error }
      }
    } finally { clear.fill(0) }
  }

  fun create(record: WalletRecord) {
    check(!exists()) { "Existing wallet must not be overwritten" }
    // Exact allocation avoids an extra unerasable ByteArrayOutputStream secret copy.
    val metadata = ByteArrayOutputStream().apply {
      DataOutputStream(this).use { out ->
        out.writeInt(1); out.writeUTF(record.id)
        out.writeInt(record.credential.credentialId.size)
        out.write(record.credential.credentialId)
        out.write(record.credential.publicKeyX); out.write(record.credential.publicKeyY)
      }
    }.toByteArray()
    val clear = metadata + record.entropy
    val encrypted = try {
      CryptoEnvelope.encrypt(keys.existing() ?: keys.create(), clear, aad)
    } finally { clear.fill(0) }
    file.write(encrypted)
  }
}
