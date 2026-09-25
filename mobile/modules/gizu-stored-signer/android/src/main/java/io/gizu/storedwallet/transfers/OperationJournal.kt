package io.gizu.storedwallet

import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID
import javax.crypto.SecretKey

internal val terminalSteps = setOf("finalized", "reverted")
internal fun quantity(value: String): java.math.BigInteger {
  require(Regex("0x(?:0|[1-9a-fA-F][0-9a-fA-F]{0,63})").matches(value))
  return value.drop(2).toBigInteger(16)
}
internal fun JSONObject.steps(): List<JSONObject> = getJSONArray("steps").let { a -> (0 until a.length()).map(a::getJSONObject) }
internal fun JSONObject.unresolved(): Boolean = steps().any { it.has("raw") && it.getString("status") !in terminalSteps }
internal fun JSONObject.blocked(): Boolean = unresolved() || (!getBoolean("cancelled") && steps().any { it.getString("status") == "planned" })
internal fun JSONObject.resumable(): Boolean {
  val unresolved = steps().filter { it.has("raw") && it.getString("status") !in terminalSteps }
  return if (unresolved.isNotEmpty()) unresolved.size == 1 && unresolved.single().getString("status") == "signed" && !unresolved.single().optBoolean("conflict")
    else !getBoolean("cancelled") && steps().any { it.getString("status") == "planned" }
}

/** Entire journal, including signed bytes, is authenticated and encrypted before any network send. */
internal class OperationJournal(private val file: WalletFile, private val key: () -> SecretKey,
  val walletId: String, generation: String, private val archive: (String, ByteArray) -> Unit) {
  private val aad = "gizu-stored-operations:v1:$walletId:$generation".toByteArray()
  private fun read(): JSONArray {
    if (!file.exists()) return JSONArray()
    val clear = CryptoEnvelope.decrypt(key(), file.read(), aad)
    try {
      val root = JSONObject(String(clear, Charsets.UTF_8))
      check(root.getInt("version") == 1 && root.getString("walletId") == walletId)
      return root.getJSONArray("operations").also { check(it.length() <= 256) }
    } finally { clear.fill(0) }
  }
  private fun write(entries: JSONArray) {
    val clear = JSONObject().put("version",1).put("walletId",walletId).put("operations",entries).toString().toByteArray()
    try { file.write(CryptoEnvelope.encrypt(key(),clear,aad)) } finally { clear.fill(0) }
  }
  fun all(): List<JSONObject> = read().let { a -> (0 until a.length()).map(a::getJSONObject) }
  fun get(id: String): JSONObject = all().single { it.getString("operationId") == id }
  fun create(steps: JSONArray): JSONObject {
    val existing = all()
    check(existing.none { it.blocked() })
    val retained = existing.filterNot { op ->
      op.getBoolean("cancelled") && op.steps().none { it.has("raw") }
    }.toMutableList()
    // Leave 1 MiB below the file limit for the new operation's signed records.
    while (retained.size >= 256 || JSONArray(retained).toString().toByteArray().size > 3 * 1024 * 1024) {
      val settled = retained.first()
      check(!settled.unresolved() && !settled.blocked())
      val clear = JSONObject().put("version",1).put("walletId",walletId)
        .put("operations",JSONArray().put(settled)).toString().toByteArray()
      try { archive(settled.getString("operationId"), CryptoEnvelope.encrypt(key(),clear,aad)) }
      finally { clear.fill(0) }
      // Archive is committed first. A crash can leave a duplicate, never lost history.
      retained.removeAt(0)
    }
    val entries = JSONArray(retained)
    val operation = JSONObject().put("operationId",UUID.randomUUID().toString()).put("walletId",walletId)
      .put("revision",1).put("cancelled",false).put("steps",steps)
    entries.put(operation); write(entries); return operation
  }
  fun update(id: String, expectedRevision: Int? = null, action: (JSONObject) -> Unit): JSONObject {
    val entries = read()
    val operation = (0 until entries.length()).map(entries::getJSONObject).single { it.getString("operationId") == id }
    if (expectedRevision != null) check(operation.getInt("revision") == expectedRevision) { "Stale operation" }
    action(operation); operation.put("revision",Math.addExact(operation.getInt("revision"),1)); write(entries)
    return operation
  }
  fun cancel(id: String) = update(id) { it.put("cancelled",true) }
  fun public(operation: JSONObject): Map<String, Any> = mapOf(
    "operationId" to operation.getString("operationId"), "walletId" to walletId,
    "revision" to operation.getInt("revision"), "canResume" to operation.resumable(), "blocked" to operation.blocked(),
    "status" to when {
      operation.getBoolean("cancelled") -> "cancelled"
      operation.steps().all { it.getString("status") in terminalSteps } -> "completed"
      operation.unresolved() -> "needsAuthorization"
      else -> "needsReview"
    },
    "steps" to operation.steps().map { s -> buildMap<String, Any> {
      put("index",s.getInt("index")); put("accountIndex",s.getInt("accountIndex"))
      for (field in listOf("from","to","valueWei","status")) put(field,s.getString(field))
      for (field in listOf("transactionHash","nonce")) if (s.has(field)) put(field,s.getString(field))
      put("nonceConflict",s.optBoolean("conflict"))
    } }
  )
}
