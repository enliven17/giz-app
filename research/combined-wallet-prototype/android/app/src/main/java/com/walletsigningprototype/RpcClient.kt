package com.walletsigningprototype

import java.math.BigInteger
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.atomic.AtomicLong
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONException

class RpcClient(private val endpoint: URL = URL("http://127.0.0.1:8545")) {
  private val requestId = AtomicLong(1)

  fun chainId(): Long = number(call("eth_chainId", JSONArray()) as String).toLong()

  fun gasPrice(): BigInteger = number(call("eth_gasPrice", JSONArray()) as String)

  fun nonce(address: String, tag: String): Long =
    number(call("eth_getTransactionCount", JSONArray().put(address).put(tag)) as String).toLong()

  fun broadcast(rawTransaction: String): String =
    call("eth_sendRawTransaction", JSONArray().put(rawTransaction)) as String

  fun receipt(hash: String): JSONObject? =
    call("eth_getTransactionReceipt", JSONArray().put(hash)) as? JSONObject

  fun blockNumber(): Long = number(call("eth_blockNumber", JSONArray()) as String).toLong()

  fun blockHash(numberHex: String): String? =
    (call("eth_getBlockByNumber", JSONArray().put(numberHex).put(false)) as? JSONObject)
      ?.optString("hash")

  private fun call(method: String, params: JSONArray): Any? {
    val connection = endpoint.openConnection() as HttpURLConnection
    connection.requestMethod = "POST"
    connection.connectTimeout = 5_000
    connection.readTimeout = 8_000
    connection.doOutput = true
    connection.setRequestProperty("Content-Type", "application/json")
    val request = JSONObject()
      .put("jsonrpc", "2.0")
      .put("id", requestId.getAndIncrement())
      .put("method", method)
      .put("params", params)
    try {
      connection.outputStream.use { it.write(request.toString().toByteArray(Charsets.UTF_8)) }
      val body = connection.inputStream.bufferedReader().use { it.readText() }
      return decodeResponse(body, method)
    } finally {
      connection.disconnect()
    }
  }

  private fun number(hex: String): BigInteger =
    BigInteger(hex.removePrefix("0x").ifEmpty { "0" }, 16)

  internal fun decodeResponse(body: String, method: String): Any? {
    val response = try { JSONObject(body) } catch (_: JSONException) {
      throw IOException("Incomplete RPC response for $method")
    }
    if (response.has("error")) throw IllegalStateException(
      "RPC $method: ${response.getJSONObject("error").optString("message")}",
    )
    return if (response.isNull("result")) null else response.get("result")
  }
}
