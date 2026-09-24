package com.walletsigningprototype

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import java.io.ByteArrayOutputStream
import java.io.InputStream
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/** Native-only file and passkey UI. Wallet material is never returned to React Native. */
class RecoveryActivity : Activity() {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
  private val engine by lazy { WalletEngine(this) }
  private lateinit var status: TextView
  private lateinit var actionButton: Button
  private var pendingEncryptedBackup: ByteArray? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val layout = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(40, 80, 40, 40)
    }
    layout.addView(TextView(this).apply {
      text = "Encrypted wallet recovery"
      textSize = 22f
    })
    status = TextView(this).apply {
      text = when (engine.walletStatus()) {
        "ready" -> "Back up this wallet with a fresh passkey confirmation."
        else -> "Choose your encrypted backup file to restore the same six accounts."
      }
      textSize = 17f
      setPadding(0, 36, 0, 36)
    }
    layout.addView(status)
    actionButton = if (engine.walletStatus() == "ready") {
      button("Back up wallet") { confirmBackup() }
    } else {
      button("Restore encrypted backup") { chooseBackup() }
    }
    layout.addView(actionButton)
    setContentView(layout)
  }

  private fun button(label: String, action: () -> Unit) = Button(this).apply {
    text = label
    setOnClickListener { action() }
    layoutParams = ViewGroup.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT,
    )
  }

  private fun confirmBackup() {
    AlertDialog.Builder(this)
      .setTitle("Back up wallet")
      .setMessage("A fresh passkey confirmation will encrypt this wallet's seed. " +
        "Save the resulting file somewhere you can retrieve after losing this phone. " +
        "The current investment unlock does not authorize this export.")
      .setNegativeButton("Cancel", null)
      .setPositiveButton("Continue") { _, _ -> createBackup() }
      .show()
  }

  private fun createBackup() {
    status.text = "Confirm with your passkey to encrypt the backup."
    scope.launch {
      try {
        val credential = withContext(Dispatchers.IO) { engine.credential() }
        val prf = PasskeyGate(this@RecoveryActivity).recoveryPrf(credential)
        pendingEncryptedBackup = try {
          val material = withContext(Dispatchers.IO) { engine.backupMaterial() }
          withContext(Dispatchers.IO) {
            try {
              check(material.credential.credentialId.contentEquals(credential.credentialId))
              RecoveryBackupCodec.encrypt(
                material.entropy, material.credential, BuildConfig.RP_ID, prf,
              )
            } finally { material.entropy.fill(0) }
          }
        } finally { prf.fill(0) }
        val intent = Intent(Intent.ACTION_CREATE_DOCUMENT)
          .addCategory(Intent.CATEGORY_OPENABLE)
          .setType("application/json")
          .putExtra(Intent.EXTRA_TITLE, "wallet-backup-encrypted.json")
        startActivityForResult(intent, SAVE_BACKUP)
      } catch (error: Exception) {
        status.text = "Backup failed: ${error.message ?: error.javaClass.simpleName}"
      }
    }
  }

  private fun chooseBackup() {
    check(engine.walletStatus() != "ready") { "Wallet already exists" }
    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT)
      .addCategory(Intent.CATEGORY_OPENABLE)
      .setType("application/json")
    startActivityForResult(intent, OPEN_BACKUP)
  }

  @Deprecated("Activity result API is sufficient for this native prototype")
  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    if (requestCode == SAVE_BACKUP) {
      val backup = pendingEncryptedBackup
      pendingEncryptedBackup = null
      if (resultCode != RESULT_OK || data?.data == null || backup == null) {
        status.text = "Backup was not saved."
        return
      }
      val destination = data.data!!
      scope.launch {
        try {
          withContext(Dispatchers.IO) {
            contentResolver.openOutputStream(destination, "w")?.use { it.write(backup) }
              ?: error("Cannot open backup destination")
          }
          status.text = "Encrypted backup saved. Keep this file and your passkey available."
        } catch (error: Exception) {
          status.text = "File save failed: ${error.message ?: error.javaClass.simpleName}"
        } finally { backup.fill(0) }
      }
    } else if (requestCode == OPEN_BACKUP && resultCode == RESULT_OK && data?.data != null) {
      val source = data.data!!
      status.text = "Reading encrypted backup."
      scope.launch {
        try {
          val backup = withContext(Dispatchers.IO) {
            contentResolver.openInputStream(source)?.use { input ->
              readLimited(input)
            } ?: error("Cannot open backup file")
          }
          val credential = RecoveryBackupCodec.credential(backup, BuildConfig.RP_ID)
          status.text = "Confirm with the original passkey to restore this wallet."
          val prf = PasskeyGate(this@RecoveryActivity).recoveryPrf(credential)
          val entropy = try {
            RecoveryBackupCodec.decrypt(backup, BuildConfig.RP_ID, prf)
          } finally { prf.fill(0) }
          val accounts = try {
            withContext(Dispatchers.IO) { engine.recoverWallet(entropy, credential) }
          } finally { entropy.fill(0) }
          setResult(RESULT_OK)
          status.text = "Wallet restored. All ${accounts.length()} accounts are available. " +
            "Previous test operations were not restored."
          actionButton.text = "Return to wallet"
          actionButton.setOnClickListener { finish() }
        } catch (error: Exception) {
          status.text = "Restore failed: ${error.message ?: error.javaClass.simpleName}"
        }
      }
    }
  }

  override fun onDestroy() {
    pendingEncryptedBackup?.fill(0)
    scope.cancel()
    super.onDestroy()
  }

  private fun readLimited(input: InputStream): ByteArray {
    val output = ByteArrayOutputStream()
    val buffer = ByteArray(4096)
    while (true) {
      val count = input.read(buffer)
      if (count < 0) break
      require(output.size() + count <= 64 * 1024) { "Backup file is too large" }
      output.write(buffer, 0, count)
    }
    return output.toByteArray()
  }

  companion object {
    private const val SAVE_BACKUP = 1
    private const val OPEN_BACKUP = 2
  }
}
