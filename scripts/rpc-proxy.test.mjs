import test from 'node:test';
import assert from 'node:assert/strict';
import { proxyRpc, STUDIO_RPC, readRequest } from './rpc-proxy.mjs';
import { safeReceipt } from './receipt.mjs';
const body = method => ({ jsonrpc: '2.0', id: 7, method, params: [] });
const respond = result => async (url, options) => {
  assert.equal(url, STUDIO_RPC);
  assert.equal(options.method, 'POST');
  return new Response(JSON.stringify({ jsonrpc: '2.0', id: 7, result }));
};
test('read-only proxy rejects signing, raw writes, batches and unknown methods before I/O', async () => {
  let calls = 0;
  for (const request of [body('eth_sendRawTransaction'), body('eth_sendTransaction'), body('sim_getNodeConfig'), [body('eth_chainId')], { ...body('gen_call'), params: null }]) {
    assert.equal((await proxyRpc(request, async () => { calls++; })).error.code, -32601);
  }
  assert.equal(calls, 0);
});
test('fee policy exposes only public scalar prices, never validator configuration', async () => {
  const output = await proxyRpc(body('sim_getFeeConfig'), respond({ enabled: true, node_config: 'private-fixture', policy: { genPerTimeUnit: '1', timeUnitOverlayBps: 250, storageUnitPrice: '2', receiptGasPrice: '3', secret: 'private-fixture', intrinsicGas: {}, private_key: 'private-fixture' } }));
  assert.deepEqual(output.result, { enabled: true, policy: { genPerTimeUnit: '1', storageUnitPrice: '2', receiptGasPrice: '3', timeUnitOverlayBps: 250 } });
  assert.ok(!JSON.stringify(output).includes('private-fixture'));
});
test('raw Studio receipt is projected and round-trips without exposing node_config', async () => {
  const output = await proxyRpc(body('eth_getTransactionByHash'), respond({ hash: `0x${'11'.repeat(32)}`, status: 'FINALIZED', consensus_data: { leader_receipt: [{ execution_result: 'SUCCESS', node_config: 'private-fixture' }] }, node_config: 'private-fixture', stdout: 'private-fixture' }));
  assert.equal(safeReceipt(output.result).successful, true);
  assert.ok(!JSON.stringify(output).includes('private-fixture'));
});
test('EVM receipts preserve required SDK fields and strip arbitrary metadata from logs', async () => {
  const output = await proxyRpc(body('eth_getTransactionReceipt'), respond({ transactionHash: 'hash', status: '0x1', node_config: 'private-fixture', logs: [{ address: 'address', data: '0x', topics: [], secret: 'private-fixture' }] }));
  assert.deepEqual(output.result.logs, [{ address: 'address', data: '0x', topics: [] }]);
  assert.ok(!JSON.stringify(output).includes('private-fixture'));
});
test('canonical views return only encoded content across verified RPC shapes', async () => {
  for (const result of ['0x0102', { data: '0x0102', node_config: 'private-fixture' }, { status: { code: 0 }, result: Buffer.from([0, 1, 2]).toString('base64'), trace: 'private-fixture' }]) {
    assert.equal((await proxyRpc(body('gen_call'), respond(result))).result, '0x0102');
  }
  assert.ok((await proxyRpc(body('gen_call'), respond({ status: { code: 1 }, data: '0x0102' }))).error);
});
test('upstream failures and unexpected scalar bodies produce generic safe errors', async () => {
  for (const upstream of [async () => { throw new Error('private-fixture'); }, async () => new Response('private-fixture', { status: 503 }), respond({ node_config: 'private-fixture' })]) {
    const output = await proxyRpc(body('eth_chainId'), upstream);
    assert.ok(output.error);
    assert.ok(!JSON.stringify(output).includes('private-fixture'));
  }
});
test('request parser enforces bounded JSON bodies', async () => {
  async function* chunks(value) { yield Buffer.from(value); }
  assert.deepEqual(await readRequest(chunks('{"id":1}')), { id: 1 });
  await assert.rejects(readRequest(chunks('x'.repeat(32769))), /bounds/);
});
