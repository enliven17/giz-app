package io.gizu.signer

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import uniffi.gizu_signer_core.NativeSignedTransfer
import uniffi.gizu_signer_core.TransferIntent

internal class TransferJournal(context: Context) {
  private val preferences = context.getSharedPreferences("gizu-native-transfers-v1", Context.MODE_PRIVATE)
  private fun read() = JSONArray(preferences.getString("entries", "[]"))
  private fun save(entries: JSONArray) { check(preferences.edit().putString("entries", entries.toString()).commit()) }
  fun unresolved(): Boolean { val entries = read(); return (0 until entries.length()).any { entries.getJSONObject(it).getString("status") !in listOf("finalized", "reverted") } }
  fun beforeBroadcast(operation: String, step: Int, tx: NativeSignedTransfer, intent: TransferIntent) {
    val entries = read(); check(entries.length() < 256)
    entries.put(JSONObject().put("operationId", operation).put("step", step).put("chainId", 10143)
      .put("from", tx.from).put("nonce", tx.nonce).put("intentHash", tx.intentHash)
      .put("transactionHash", tx.transactionHash).put("status", "unknown")
      .put("to", intent.to).put("valueWei", intent.valueHex.removePrefix("0x").toBigInteger(16).toString()))
    save(entries)
  }
  suspend fun reconcile(rpc: MonadRpc): String {
    val entries = read()
    check(rpc.text("eth_chainId") == "0x279f")
    for (i in 0 until entries.length()) {
      val entry = entries.getJSONObject(i)
      if (entry.getString("status") in listOf("finalized", "reverted")) continue
      val hash = entry.getString("transactionHash")
      val receipt = rpc.call("eth_getTransactionReceipt", JSONArray().put(hash))
      if (receipt is JSONObject) {
        check(receipt.getString("transactionHash").equals(hash, true))
        check(receipt.getString("from").equals(entry.getString("from"), true))
        val block = receipt.getString("blockNumber")
        val canonical = rpc.call("eth_getBlockByNumber", JSONArray().put(block).put(false)) as JSONObject
        val finalized = rpc.call("eth_getBlockByNumber", JSONArray().put("finalized").put(false)) as JSONObject
        val canonicalMatch = canonical.getString("hash").equals(receipt.getString("blockHash"), true)
        val finalEnough = finalized.getString("number").removePrefix("0x").toBigInteger(16) >= block.removePrefix("0x").toBigInteger(16)
        val status = receipt.getString("status")
        check(status == "0x0" || status == "0x1")
        entry.put("status", if (canonicalMatch && finalEnough) { if (status == "0x1") "finalized" else "reverted" } else "pending")
      } else {
        val tx = rpc.call("eth_getTransactionByHash", JSONArray().put(hash))
        entry.put("status", if (tx is JSONObject) "pending" else "unknown")
      }
    }
    save(entries); return entries.toString()
  }
  fun publicStatus(): String = read().toString()
}

/** Full-screen native review: no React views, WebView, exported Activity or mutable JS state. */
