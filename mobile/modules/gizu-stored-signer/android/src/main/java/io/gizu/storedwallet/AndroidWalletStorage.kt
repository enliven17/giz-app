package io.gizu.storedwallet

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.AtomicFile
import java.io.File
import java.security.KeyStore
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

internal fun walletStore(context: Context) = WalletStore(AndroidWalletFile(context), AndroidWalletKeys())
internal class AndroidWalletFile(context: Context) : WalletFile {
  private val base = File(context.noBackupFilesDir, "gizu-stored-wallet-v1.enc")
  private val file = AtomicFile(base)
  override fun exists() = base.exists() || File(base.path + ".bak").exists()
  override fun read(): ByteArray = file.openRead().use { input ->
    // Bounded before allocation even if local data is corrupt.
    val buffer = ByteArray(8193)
    var used = 0
    while (used < buffer.size) {
      val n = input.read(buffer, used, buffer.size - used)
      if (n < 0) break
      used += n
    }
    require(used <= 8192)
    buffer.copyOf(used)
  }
  override fun write(bytes: ByteArray) {
    val stream = file.startWrite()
    try { stream.write(bytes); file.finishWrite(stream) }
    catch (error: Exception) { file.failWrite(stream); throw error }
  }
}
internal class AndroidWalletKeys : WalletKeys {
  private val alias = "io.gizu.storedwallet.v1.wallet-aes"
  private fun store() = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
  override fun existing(): SecretKey? = store().getKey(alias, null) as? SecretKey
  override fun reset(): SecretKey {
    store().deleteEntry(alias)
    return create()
  }
  override fun create(): SecretKey {
    check(!store().containsAlias(alias))
    return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply {
      init(KeyGenParameterSpec.Builder(alias, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
        .setKeySize(256).setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setRandomizedEncryptionRequired(true).setUserAuthenticationRequired(false).build())
    }.generateKey()
  }
}
