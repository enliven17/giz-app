import Foundation

final class NativeTransferJournal {
  private let url: URL
  init() throws {
    let directory = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
    url = directory.appendingPathComponent("gizu-native-transfers-v1.json")
  }
  private func read() throws -> [[String: Any]] {
    guard FileManager.default.fileExists(atPath: url.path) else { return [] }
    let data = try Data(contentsOf: url)
    guard data.count <= 1_048_576, let value = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] else { throw TransferFailure.stopped }
    return value
  }
  private func save(_ entries: [[String: Any]]) throws {
    try JSONSerialization.data(withJSONObject: entries).write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    let handle = try FileHandle(forWritingTo: url); defer { try? handle.close() }
    try handle.synchronize()
  }
  func unresolved() throws -> Bool { try read().contains { !["finalized", "reverted"].contains($0["status"] as? String ?? "") } }
  func beforeBroadcast(operation: String, step: Int, tx: NativeSignedTransfer, intent: TransferIntent) throws {
    guard let value = UInt64(intent.valueHex.dropFirst(2), radix: 16) else { throw TransferFailure.stopped }
    var entries = try read(); guard entries.count < 256 else { throw TransferFailure.stopped }
    entries.append(["operationId": operation, "step": step, "chainId": 10143, "from": tx.from, "nonce": tx.nonce,
                    "intentHash": tx.intentHash, "transactionHash": tx.transactionHash, "status": "unknown", "to": intent.to, "valueWei": String(value)])
    try save(entries)
  }
  func publicStatus() throws -> String { String(decoding: try JSONSerialization.data(withJSONObject: read()), as: UTF8.self) }
  func reconcile(_ rpc: MonadRPC) async throws -> String {
    guard try await rpc.text("eth_chainId") == "0x279f" else { throw TransferFailure.stopped }
    var entries = try read()
    for index in entries.indices {
      if ["finalized", "reverted"].contains(entries[index]["status"] as? String ?? "") { continue }
      guard let hash = entries[index]["transactionHash"] as? String, let from = entries[index]["from"] as? String else { throw TransferFailure.stopped }
      if let receipt = try await rpc.call("eth_getTransactionReceipt", [hash]) as? [String: Any] {
        guard (receipt["transactionHash"] as? String)?.lowercased() == hash.lowercased(),
              (receipt["from"] as? String)?.lowercased() == from.lowercased(),
              let block = receipt["blockNumber"] as? String,
              let blockNumber = UInt64(block.dropFirst(2), radix: 16),
              let receiptHash = receipt["blockHash"] as? String,
              let status = receipt["status"] as? String, ["0x0", "0x1"].contains(status),
              let canonical = try await rpc.call("eth_getBlockByNumber", [block, false]) as? [String: Any],
              let finalized = try await rpc.call("eth_getBlockByNumber", ["finalized", false]) as? [String: Any],
              let finalHex = finalized["number"] as? String, let finalNumber = UInt64(finalHex.dropFirst(2), radix: 16)
        else { throw TransferFailure.stopped }
        let canonicalMatch = (canonical["hash"] as? String)?.lowercased() == receiptHash.lowercased()
        entries[index]["status"] = canonicalMatch && finalNumber >= blockNumber ? (status == "0x1" ? "finalized" : "reverted") : "pending"
      } else {
        let transaction = try await rpc.call("eth_getTransactionByHash", [hash])
        entries[index]["status"] = transaction is [String: Any] ? "pending" : "unknown"
      }
    }
    try save(entries); return try publicStatus()
  }
}

