import { safeReceipt } from './receipt.mjs';
export const STUDIO_RPC = 'https://studio-next.genlayer.com/api';
const allowed = new Set(['eth_chainId', 'eth_blockNumber', 'eth_getTransactionCount', 'eth_estimateGas', 'eth_gasPrice', 'eth_getBalance', 'eth_getTransactionByHash', 'eth_getTransactionReceipt', 'gen_call', 'gen_getContractSchema', 'sim_getFeeConfig']);
const pick = (source, fields) => Object.fromEntries(fields.filter(field => source && Object.hasOwn(source, field)).map(field => [field, source[field]]));
const integer = value => typeof value === 'number' && Number.isSafeInteger(value) || typeof value === 'string' && /^(0x[0-9a-fA-F]+|[0-9]+)$/.test(value);
export async function proxyRpc(body, upstream = fetch) {
  const id = typeof body?.id === 'number' || typeof body?.id === 'string' ? body.id : null;
  const fail = (code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });
  if (!body || !allowed.has(body.method) || !Array.isArray(body.params)) return fail(-32601, 'Only supported read-only Studio Dev RPC methods are available.');
  try {
    const response = await upstream(STUDIO_RPC, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id, method: body.method, params: body.params }), signal: AbortSignal.timeout(25000) });
    if (!response.ok) return fail(-32000, 'Studio Dev is temporarily unavailable.');
    const raw = await response.json();
    if (raw.error) return fail(Number.isSafeInteger(raw.error.code) ? raw.error.code : -32000, 'Studio Dev could not complete this RPC request.');
    let result = raw.result;
    if (body.method === 'sim_getFeeConfig') {
      const fields = ['genPerTimeUnit', 'storageUnitPrice', 'receiptGasPrice', 'timeUnitOverlayBps', 'intrinsicGas', 'bootloaderOverhead', 'gasPerChangedSlot', 'calldataGasPerByte', 'fixedProposeReceiptGas', 'fixedMessageRevealGas', 'messageFeeParamsBudgetFloor'];
      if (typeof result?.enabled !== 'boolean' || !result.policy) return fail(-32000, 'Studio Dev did not expose a valid fee policy.');
      result = { enabled: result.enabled, policy: Object.fromEntries(fields.filter(field => integer(result.policy[field])).map(field => [field, result.policy[field]])) };
    } else if (body.method === 'eth_getTransactionByHash' && result) {
      result = { ...safeReceipt(result), ...pick(result, ['from', 'to', 'nonce', 'gas', 'gasPrice', 'input', 'value', 'blockHash', 'blockNumber', 'transactionIndex', 'type', 'chainId']) };
    } else if (body.method === 'eth_getTransactionReceipt' && result) {
      result = { ...pick(result, ['transactionHash', 'transactionIndex', 'blockHash', 'blockNumber', 'from', 'to', 'cumulativeGasUsed', 'gasUsed', 'contractAddress', 'logsBloom', 'status', 'effectiveGasPrice', 'type']),
        logs: (Array.isArray(result.logs) ? result.logs : []).map(log => pick(log, ['address', 'data', 'topics', 'blockNumber', 'transactionHash', 'transactionIndex', 'blockHash', 'logIndex', 'removed'])) };
    } else if (body.method === 'gen_call') {
      if (typeof result === 'object' && result !== null) {
        if (result.status && result.status.code !== 0 || result.execution_result && result.execution_result !== 'SUCCESS') return fail(-32000, 'The canonical contract view failed.');
        const data = result.data ?? result.result ?? result.return_data;
        const isEncodedResult = Object.hasOwn(result, 'result') && !Object.hasOwn(result, 'data');
        if (typeof data === 'string' && !data.startsWith('0x') && (isEncodedResult || !/^[0-9a-fA-F]*$/.test(data))) {
          if (!/^[A-Za-z0-9+/=]+$/.test(data)) return fail(-32000, 'The contract view encoding is invalid.');
          result = '0x' + Buffer.from(data, 'base64').subarray(1).toString('hex');
        } else result = data;
      }
      if (typeof result === 'string' && /^[0-9a-fA-F]*$/.test(result)) result = '0x' + result;
      if (typeof result !== 'string' || !/^0x[0-9a-fA-F]*$/.test(result)) return fail(-32000, 'The contract view could not be decoded.');
    } else if (body.method === 'gen_getContractSchema') {
      result = pick(result, ['ctor', 'methods']);
    } else if (result !== null && !integer(result)) {
      return fail(-32000, 'Studio Dev returned an unexpected scalar result.');
    }
    return { jsonrpc: '2.0', id, result };
  } catch { return fail(-32000, 'Studio Dev is temporarily unavailable.'); }
}

export async function readRequest(request) {
  let content = '';
  for await (const chunk of request) {
    content += chunk.toString();
    if (content.length > 32768) throw new Error('Request exceeds the supported bounds.');
  }
  return JSON.parse(content);
}
