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
const addresses = process.argv.slice(2);
if (addresses.length !== 6 || addresses.some(address => !/^0x[0-9a-fA-F]{40}$/.test(address))) {
  throw new Error('Pass exactly six public EVM addresses');
}
if (await rpc('eth_chainId') !== '0x7a69') throw new Error('Wrong test chain');
const [funding] = await rpc('eth_accounts');
for (const [index, address] of addresses.entries()) {
  const txHash = await rpc('eth_sendTransaction', [{
    from: funding,
    to: address,
    value: '0x2386f26fc10000', // 0.01 test ETH
  }]);
  const receipt = await rpc('eth_getTransactionReceipt', [txHash]);
  if (receipt?.status !== '0x1') throw new Error(`Funding account ${index + 1} failed`);
  console.log(`${index + 1} ${address} ${txHash}`);
}
