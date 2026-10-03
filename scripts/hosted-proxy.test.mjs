import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../frontend/api/genlayer-rpc.mjs';

function response() {
  return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(value) { this.body = JSON.parse(value); } };
}
test('hosted proxy rejects non-POST and signing methods before upstream I/O', async () => {
  const oldFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new Error('must not fetch'); };
  try {
    const get = response(); await handler({ method: 'GET' }, get); assert.equal(get.statusCode, 405);
    const write = response(); await handler({ method: 'POST', body: { id: 1, method: 'eth_sendRawTransaction', params: [] } }, write);
    assert.equal(write.body.error.code, -32601); assert.equal(calls, 0);
  } finally { globalThis.fetch = oldFetch; }
});
test('hosted proxy accepts Vercel parsed and text JSON bodies without exposing upstream configuration', async () => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ result: '0xf22d' }));
  try {
    const body = { jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] };
    for (const input of [body, JSON.stringify(body)]) {
      const result = response(); await handler({ method: 'POST', body: input }, result);
      assert.equal(result.statusCode, 200); assert.equal(result.body.result, '0xf22d'); assert.equal(result.headers['cache-control'], 'no-store');
    }
  } finally { globalThis.fetch = oldFetch; }
});
test('hosted proxy applies the same 32 KB bound before upstream I/O and returns generic parse errors', async () => {
  const oldFetch = globalThis.fetch;
  let calls = 0; globalThis.fetch = async () => { calls++; throw new Error('must not fetch'); };
  try {
    for (const body of [{ method: 'gen_call', params: ['x'.repeat(32769)] }, '{PRIVATE_FIXTURE']) {
      const result = response(); await handler({ method: 'POST', body }, result);
      assert.equal(result.statusCode, 400); assert.deepEqual(result.body, { error: 'Invalid bounded RPC request.' });
    }
    assert.equal(calls, 0);
  } finally { globalThis.fetch = oldFetch; }
});
