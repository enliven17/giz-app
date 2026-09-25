package io.gizu.storedwallet

import android.content.Context
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import org.json.JSONArray
import org.json.JSONObject
import uniffi.gizu_stored_signer_core.*

internal fun operationJournal(context: Context, record: WalletRecord): OperationJournal {
  check(record.verified)
  return OperationJournal(AndroidWalletFile(context,"gizu-operations-${record.journalId}.enc",4 * 1024 * 1024),
    { checkNotNull(AndroidWalletKeys().existing()) },record.id,record.journalId)
}

internal fun canonicalProposal(walletId: String, request: Map<String, Any?>): JSONObject {
  check(request.keys == setOf("walletId","chainId","transfers"))
  check(request["walletId"] == walletId)
  val p = JSONObject(request).apply { remove("walletId"); put("kind","nativeTransfers") }
  // Expo's generic map represents JS numbers as Double. Canonicalize only exact integers.
  check((p.get("chainId") as? Number)?.toDouble() == 10143.0)
  p.put("chainId",10143)
  val incoming=p.getJSONArray("transfers")
  for (i in 0 until incoming.length()) {
    val row=incoming.getJSONObject(i); val index=row.get("accountIndex") as? Number ?: error("Invalid index")
    check(index.toDouble().isFinite() && index.toDouble() == index.toInt().toDouble() && index.toInt() in 0..15)
    row.put("accountIndex",index.toInt())
  }
  return p
}

internal fun createOperation(journal: OperationJournal, record: WalletRecord, request: Map<String, Any?>): JSONObject {
  check(record.verified)
  val p=canonicalProposal(record.id,request)
  validateTransferProposal(p.toString())
  val addresses = deriveAccountAddresses(record.entropy)
  val rows = p.getJSONArray("transfers")
  val steps = JSONArray()
  for (i in 0 until rows.length()) {
    val row = rows.getJSONObject(i)
    val index = row.getInt("accountIndex")
    check(row.getString("expectedFrom").equals(addresses[index],true))
    steps.put(JSONObject().put("index",i).put("accountIndex",index).put("from",addresses[index])
      .put("to",row.getString("to")).put("valueWei",row.getString("valueWei")).put("status","planned"))
  }
  return journal.create(steps)
}

internal data class PreparedReview(val id: String, val revision: Int, val text: String, val indices: List<Int>, val retry: Boolean)

/** Native-private engine. Approval and passkey verification are supplied only by TransferActivity. */
internal class TransferEngine(private val store: WalletStore, val journal: OperationJournal, private val rpc: TransferRpc) : AutoCloseable {
  private var signer: TransferOperation? = null
  suspend fun prepare(id: String, expectedRevision: Int): PreparedReview {
    check(journal.get(id).getInt("revision") == expectedRevision)
    reconcileOperations(journal,rpc)
    val op = journal.get(id)
    check(op.resumable()) { "Reconcile pending transfers before resume" }
    val raw = op.steps().firstOrNull { it.has("raw") && it.getString("status") !in terminalSteps }
    if (raw != null) {
      check(raw.getString("status") == "signed" && !raw.optBoolean("conflict"))
      checkRetry(raw)
      return PreparedReview(id,op.getInt("revision"),retryReview(raw),listOf(raw.getInt("index")),true)
    }
    check(!op.getBoolean("cancelled"))
    val steps = op.steps().filter { it.getString("status") == "planned" }
    check(steps.isNotEmpty())
    val chain = rpc.text("eth_chainId")
    val fee = rpc.text("eth_gasPrice")
    val priority = rpc.text("eth_maxPriorityFeePerGas")
    val nonces = mutableMapOf<String,String>(); val balances = mutableMapOf<String,String>()
    val quotes = steps.map { s ->
      val from = s.getString("from"); val to = s.getString("to")
      val nonce = nonces[from] ?: rpc.text("eth_getTransactionCount",from,"pending").also { nonces[from]=it }
      val balance = balances[from] ?: rpc.text("eth_getBalance",from,"pending").also { balances[from]=it }
      val values = steps.filter { it.getString("from") == from }.map { "0x" + it.getString("valueWei").toBigInteger().toString(16) }
      requireTransferBalance(balance,values,fee)
      val value = "0x" + s.getString("valueWei").toBigInteger().toString(16)
      val gas = rpc.call("eth_estimateGas",JSONArray().put(JSONObject().put("from",from).put("to",to).put("value",value).put("data","0x"))) as String
      TransferQuote(chain,nonce,gas,fee,priority,balance,rpc.text("eth_getCode",to,"pending"),rpc.text("eth_getCode",from,"pending"))
    }
    val spentFee = op.steps().filter { it.has("raw") }.fold(java.math.BigInteger.ZERO) { total,s ->
      total + quantity(s.getJSONObject("quote").getString("maxFee")) * 21000.toBigInteger()
    }
    check(spentFee + quantity(fee) * (21000L * steps.size).toBigInteger() <= "100000000000000000".toBigInteger())
    val proposal = JSONObject().put("kind","nativeTransfers").put("chainId",10143).put("transfers",JSONArray(steps.map { s ->
      JSONObject().put("accountIndex",s.getInt("accountIndex")).put("expectedFrom",s.getString("from"))
        .put("to",s.getString("to")).put("valueWei",s.getString("valueWei"))
    }))
    currentCoroutineContext().ensureActive()
    signer = store.load().use { record -> check(record.verified && record.id == journal.walletId); TransferOperation(proposal.toString(),record.entropy) }
    val review = signer!!.prepare(quotes)
    val occurrences = mutableMapOf<String,Int>()
    val updated = journal.update(id,op.getInt("revision")) { target ->
      steps.zip(quotes).forEach { (s,q) ->
        val from=s.getString("from"); val offset=occurrences[from] ?: 0; occurrences[from]=offset+1
        val nonce=(quantity(q.nonce)+offset.toBigInteger()).toString()
        val targetStep=target.getJSONArray("steps").getJSONObject(s.getInt("index"))
        targetStep.put("nonce",nonce).put("quote",JSONObject().put("gas",q.gas).put("maxFee",q.maxFee).put("priorityFee",q.priorityFee))
      }
    }
    return PreparedReview(id,updated.getInt("revision"),"${steps.size} remaining transfer(s). Previously completed transfers will not repeat.\n\n$review",steps.map { it.getInt("index") },false)
  }
  private fun retryReview(s: JSONObject): String {
    val q=s.getJSONObject("quote")
    return "MONAD TESTNET · chain 10143\nRetry the exact previously signed transaction. No new signature or fee replacement.\n\nAccount ${s.getInt("accountIndex")}\nFrom ${s.getString("from")}\nTo ${s.getString("to")}\nAmount ${s.getString("valueWei")} wei\nNonce ${s.getString("nonce")}\nGas ${quantity(q.getString("gas"))}\nMax fee/gas ${quantity(q.getString("maxFee"))} wei\nPriority/gas ${quantity(q.getString("priorityFee"))} wei\nMaximum fee ${quantity(q.getString("maxFee"))*21000.toBigInteger()} wei\nHash ${s.getString("transactionHash")}\n\nOnly this saved transaction will be retried. Refresh status before resuming any remaining steps."
  }
  private suspend fun checkRetry(s: JSONObject) {
    check(quantity(rpc.text("eth_chainId")) == 10143.toBigInteger())
    check(quantity(rpc.text("eth_getTransactionCount",s.getString("from"),"pending")) == s.getString("nonce").toBigInteger())
    check(quantity(rpc.text("eth_getTransactionCount",s.getString("from"),"latest")) == s.getString("nonce").toBigInteger())
    check(rpc.text("eth_getCode",s.getString("from"),"pending") == "0x" && rpc.text("eth_getCode",s.getString("to"),"pending") == "0x")
    requireTransferBalance(rpc.text("eth_getBalance",s.getString("from"),"pending"),listOf("0x"+s.getString("valueWei").toBigInteger().toString(16)),s.getJSONObject("quote").getString("maxFee"))
  }
  suspend fun execute(review: PreparedReview, checkAuthority: () -> Unit) {
    check(journal.get(review.id).getInt("revision") == review.revision)
    checkAuthority(); currentCoroutineContext().ensureActive()
    if (review.retry) {
      val s=journal.get(review.id).steps()[review.indices.single()]
      checkRetry(s); checkAuthority(); currentCoroutineContext().ensureActive()
      // An uncertain send stays unknown; refresh never invokes this path.
      journal.update(review.id,review.revision) { it.steps()[s.getInt("index")].put("status","unknown") }
      val returned=rpc.text("eth_sendRawTransaction",s.getString("raw"))
      check(returned.equals(s.getString("transactionHash"),true))
      reconcileOperations(journal,rpc); return
    }
    val core=checkNotNull(signer); core.approve()
    for (index in review.indices) {
      checkAuthority(); currentCoroutineContext().ensureActive()
      val s=journal.get(review.id).steps()[index]
      check(s.getString("status") == "planned")
      val chain=rpc.text("eth_chainId"); val nonce=rpc.text("eth_getTransactionCount",s.getString("from"),"pending")
      val code=rpc.text("eth_getCode",s.getString("to"),"pending"); val senderCode=rpc.text("eth_getCode",s.getString("from"),"pending")
      checkAuthority(); currentCoroutineContext().ensureActive()
      val tx=core.signNext(nonce,chain,code,senderCode)
      persistAndBroadcast(journal,rpc,review.id,index,tx,checkAuthority)
      reconcileOperations(journal,rpc)
      repeat(3) {
        if (journal.get(review.id).steps()[index].getString("status") !in terminalSteps) {
          kotlinx.coroutines.delay(1000); checkAuthority(); reconcileOperations(journal,rpc)
        }
      }
      // No automatic retry, and no later step until this one is finalized.
      if (journal.get(review.id).steps()[index].getString("status") != "finalized") break
    }
  }
  override fun close() { signer?.invalidate(); signer?.destroy(); signer=null }
}

internal suspend fun persistAndBroadcast(journal: OperationJournal,rpc: TransferRpc,id: String,index: Int,
  tx: NativeSignedTransfer, checkAuthority: () -> Unit) {
  journal.update(id) { op ->
    val s=op.steps()[index]
    check(!op.getBoolean("cancelled") && s.getString("status") == "planned")
    check(tx.from.equals(s.getString("from"),true) && tx.nonce == s.getString("nonce"))
    s.put("raw",tx.rawTransaction).put("transactionHash",tx.transactionHash).put("status","unknown")
  }
  currentCoroutineContext().ensureActive(); checkAuthority()
  val returned=rpc.text("eth_sendRawTransaction",tx.rawTransaction)
  check(returned.equals(tx.transactionHash,true))
}
