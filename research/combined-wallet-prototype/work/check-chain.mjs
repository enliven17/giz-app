const endpoint = 'http://127.0.0.1:8545';
let id = 0;
async function rpc(method, params = []) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({jsonrpc: '2.0', id: ++id, method, params}),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}
const addresses = new Set(process.argv.slice(2).map(value => value.toLowerCase()));
if (addresses.size !== 6) throw new Error('Provide six unique public addresses');
if (await rpc('eth_chainId') !== '0x7a69') throw new Error('Wrong chain');
const height = Number.parseInt(await rpc('eth_blockNumber'), 16);
const transactions = [];
for (let number = 0; number <= height; number++) {
  const block = await rpc('eth_getBlockByNumber', [`0x${number.toString(16)}`, true]);
  for (const tx of block.transactions) {
    if (!addresses.has(tx.from.toLowerCase())) continue;
    const receipt = await rpc('eth_getTransactionReceipt', [tx.hash]);
    transactions.push({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      nonce: Number.parseInt(tx.nonce, 16),
      valueWei: BigInt(tx.value).toString(),
      blockNumber: number,
      blockHash: receipt.blockHash,
      success: receipt.status === '0x1',
      selfTransfer: tx.from.toLowerCase() === tx.to?.toLowerCase(),
    });
  }
}
console.log(JSON.stringify({chainId: 31337, blockHeight: height, transactionCount: transactions.length, transactions}, null, 2));
