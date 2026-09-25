package io.gizu.storedwallet

import org.junit.Assert.*
import org.junit.Test
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

class WalletStoreTest {
  private class File : WalletFile {
    var bytes: ByteArray? = null
    var fail = false
    override fun exists() = bytes != null
    override fun read() = bytes!!.copyOf()
    override fun write(bytes: ByteArray) { if (fail) error("disk full"); this.bytes = bytes.copyOf() }
  }
  private class Keys : WalletKeys {
    var key: SecretKey? = null
    var created = 0
    override fun existing() = key
    override fun create(): SecretKey {
      created++
      return KeyGenerator.getInstance("AES").apply { init(256) }.generateKey().also { key = it }
    }
  }
  private fun wallet() = WalletRecord("7aafcc2e-0891-4e31-a7d4-03780d7b4f12",
    StoredPasskey(byteArrayOf(1,2,3), ByteArray(32){3}, ByteArray(32){4}), ByteArray(32){it.toByte()})

  @Test fun roundTripRestartAndPublicStateNeverExposeEntropy() {
    val file=File(); val keys=Keys(); val store=WalletStore(file,keys)
    assertEquals("absent",store.state()["status"])
    wallet().use { store.create(it) }
    val reopened=WalletStore(file,keys)
    reopened.load().use { assertArrayEquals(ByteArray(32){it.toByte()},it.entropy) }
    assertEquals(setOf("status","walletId"),reopened.state().keys)
    assertEquals("backupRequired",reopened.state()["status"])
    val record=reopened.load();record.close();assertTrue(record.entropy.all{it==0.toByte()})
    assertEquals(1,keys.created)
  }
  @Test fun missingKeyOrCorruptionNeverRegeneratesOrOverwrites() {
    val file=File(); val keys=Keys(); val store=WalletStore(file,keys)
    wallet().use { store.create(it) }; val original=file.bytes!!.copyOf()
    keys.key=null
    assertEquals("recoveryRequired",store.state()["status"])
    assertEquals(1,keys.created)
    assertThrows(IllegalStateException::class.java) { wallet().use { store.create(it) } }
    assertArrayEquals(original,file.bytes)
    file.bytes!![10]=(file.bytes!![10].toInt() xor 1).toByte()
    assertEquals("recoveryRequired",store.state()["status"])
  }
  @Test fun tamperAndWrongKeyFailClosed() {
    val file=File(); val keys=Keys(); val store=WalletStore(file,keys)
    wallet().use { store.create(it) }
    file.bytes!![file.bytes!!.lastIndex]=(file.bytes!!.last().toInt() xor 1).toByte()
    assertEquals("recoveryRequired",store.state()["status"])
    keys.key=KeyGenerator.getInstance("AES").apply { init(256) }.generateKey()
    assertEquals("recoveryRequired",store.state()["status"])
  }
  @Test fun failedWriteDoesNotReportSuccessfulCreation() {
    val file=File().apply{fail=true};val store=WalletStore(file,Keys())
    assertThrows(IllegalStateException::class.java) { wallet().use { store.create(it) } }
    assertEquals("absent",store.state()["status"])
  }
}
