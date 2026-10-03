import { afterEach, describe, expect, it, vi } from 'vitest';
import { abi, decodeInputData, deriveExternalMessageCallKey, encodeExternalMessageFeeParams, MessageType } from 'genlayer-js';
import { studioDevnet } from 'genlayer-js/chains';
import { decodeFunctionData, toHex, type Abi } from 'viem';
import { createStudioAdapter, switchStudioNetwork, type FeeProfiles } from '../src/studio-adapter';
import type { Address, Progress, Write } from '../src/adapter';
const contractAddress = `0x${'22'.repeat(20)}`;
const account: Address = `0x${'11'.repeat(20)}`;
const peer: Address = `0x${'44'.repeat(20)}`;
const hash = `0x${'33'.repeat(32)}`;
const blockHash = `0x${'55'.repeat(32)}`;
afterEach(() => vi.unstubAllGlobals());
describe('Studio Dev adapter preflight', () => {
  it('makes canonical reads available for a valid deployed address', () => {
    expect(createStudioAdapter({ contractAddress, rpcUrl: 'https://offline.invalid' }).configured).toBe(true);
  });
  it('switches the explicitly selected provider to the verified Studio Dev chain', async () => {
    const request = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce('0xf22d');
    await switchStudioNetwork({ request });
    expect(request.mock.calls[0][0]).toEqual({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xf22d' }] });
  });
  it('adds an unknown chain using current SDK parameters then verifies the result', async () => {
    const request = vi.fn().mockRejectedValueOnce({ code: 4902 }).mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce('0xf22d');
    await switchStudioNetwork({ request });
    expect(request.mock.calls[1][0].method).toBe('wallet_addEthereumChain');
    expect(request.mock.calls[1][0].params[0].rpcUrls).toEqual(studioDevnet.rpcUrls.default.http);
  });
  it('refuses a wrong network instead of pretending to switch', async () => {
    await expect(switchStudioNetwork({ request: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce('0x1') })).rejects.toThrow('not on Studio Dev');
  });
});

function offline(method: Write, terminal = 'SUCCESS', envelopeReverted = false) {
  const calls: { url: string; method: string; params: unknown[] }[] = [];
  let polled = 0;
  const canonical = { id: 'CD-test', title: 'Test-only canonical fixture', phase: 'ACTIVE', version: 1,
    digest: 'digest', deadline: 2100000000, members: ['A', 'B', 'C'].map((id, index) => ({ id, address: [account, peer, contractAddress][index], terms: `${id} terms`, ratified: true })), active_proposal: '', proposal_ids: [] };
  vi.stubGlobal('fetch', vi.fn(async (url: string, options: RequestInit) => {
    const body = JSON.parse(String(options.body));
    calls.push({ url: String(url), method: body.method, params: body.params });
    let result: unknown;
    if (body.method === 'sim_getFeeConfig') result = { enabled: true, policy: { genPerTimeUnit: '1', storageUnitPrice: '0', receiptGasPrice: method==='withdraw'?'250000000':'0', timeUnitOverlayBps: '0' } };
    else if (body.method === 'eth_getTransactionCount') result = '0x0';
    else if (body.method === 'eth_estimateGas') result = '0x30d40';
    else if (body.method === 'eth_gasPrice') result = '0x0';
    else if (body.method === 'eth_getTransactionReceipt') result = { transactionHash: hash, transactionIndex: '0x0', blockHash, blockNumber: '0x1', from: account, to: studioDevnet.consensusMainContract!.address, cumulativeGasUsed: '0x1', gasUsed: '0x1', effectiveGasPrice: '0x0', contractAddress: null, logs: [], logsBloom: `0x${'00'.repeat(256)}`, status: envelopeReverted ? '0x0' : '0x1', type: '0x0' };
    else if (body.method === 'eth_getTransactionByHash') result = { status: polled++ === 0 ? 'ACCEPTED' : 'FINALIZED', execution_result: terminal, hash };
    else if (body.method === 'gen_call') {
      const decoded = decodeInputData(body.params[0].data, contractAddress as Address);
      const functionName = decoded && 'callData' in decoded && decoded.callData instanceof Map ? decoded.callData.get('') : undefined;
      result = toHex(abi.calldata.encode(JSON.stringify(functionName === 'get_actions' ? ['propose_amendment'] : functionName === 'get_charters' ? [canonical] : functionName === 'get_credits' ? [] : canonical)));
    } else throw new Error(`Unexpected offline RPC: ${body.method}`);
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, result }), { headers: { 'content-type': 'application/json' } });
  }));
  const provider = { request: vi.fn(async ({ method: requested }: { method: string; params?: unknown[] }): Promise<unknown> => {
    if (requested === 'eth_accounts') return [account];
    if (requested === 'eth_chainId') return '0xf22d';
    if (requested === 'wallet_switchEthereumChain') return null;
    if (requested === 'eth_sendTransaction') return hash;
    throw new Error(`Unexpected selected-provider method: ${requested}`);
  }) };
  const feeProfiles: FeeProfiles = { version: 1, network: 'studio-dev', methods: { [method]: { leaderTimeunitsAllocation: '100', validatorTimeunitsAllocation: '200', executionBudgetPerRound: '0', totalMessageFees: '0', rotationsPerRound: '0' } } };
  const config = { contractAddress, account, provider, rpcUrl: 'https://offline.invalid/genlayer-rpc', feeProfiles, pollIntervalMs: 0 };
  return { calls, provider, config, canonical };
}

describe('actual project adapter with real SDK; only RPC/provider I/O intercepted', () => {
  it('pins the native withdrawal allocation to the selected recipient and finalization in the signed SDK ABI', async () => {
    const {config,provider}=offline('withdraw');
    config.feeProfiles.methods.withdraw!.totalMessageFees='187500000000000';
    await createStudioAdapter(config).write('withdraw',['CD-test'],0,vi.fn());
    const sent=provider.request.mock.calls.find(([request])=>request.method==='eth_sendTransaction')![0] as {params:{data:`0x${string}`}[]};
    const decoded=decodeFunctionData({abi:studioDevnet.consensusMainContract!.abi as Abi,data:sent.params[0].data});
    const params=decoded.args![0] as {userValue:bigint;feesDistribution:{totalMessageFees:bigint};messageAllocations:{messageType:number;onAcceptance:boolean;parentIndex:bigint;recipient:string;callKey:string;budget:bigint;feeParams:string}[]};
    expect(params.userValue).toBe(0n);
    expect(params.messageAllocations).toHaveLength(1);
    expect(params.feesDistribution.totalMessageFees).toBe(150000000000000n);
    expect(params.messageAllocations[0]).toMatchObject({messageType:MessageType.External,onAcceptance:false,parentIndex:(1n<<256n)-1n,recipient:account,callKey:deriveExternalMessageCallKey('0x'),budget:150000000000000n,feeParams:encodeExternalMessageFeeParams({gasLimit:500000n,maxGasPrice:300000000n})});
  });
  it.each(['0','1'])('refuses a withdrawal whose measured native budget is %s before wallet submission',async budget=>{
    const {config,provider}=offline('withdraw');config.feeProfiles.methods.withdraw!.totalMessageFees=budget;
    await expect(createStudioAdapter(config).write('withdraw',['CD-test'],0,vi.fn())).rejects.toThrow(budget==='0'?'measured native transfer':'exceeds its measured budget');
    expect(provider.request.mock.calls.some(([request])=>request.method==='eth_sendTransaction')).toBe(false);
  });
  it('retains the submitted hash when the SDK rejects the EVM envelope after signing',async()=>{
    const {config}=offline('ratify','SUCCESS',true);const progress:Progress[]=[];
    await expect(createStudioAdapter(config).write('ratify',['CD-test','digest'],0,event=>progress.push(event))).rejects.toThrow('could not be confirmed');
    expect(progress.map(event=>event.stage)).toEqual(['Signing','Submitted','Failed']);
    expect(progress.at(-1)?.hash).toBe(hash);
  });
  it.each([['ratify', ['CD-test', 'digest'], 0], ['propose_amendment', ['CD-test', 'AM-test', 1, 'digest', 'A terms', 'B terms', 'C terms', 2100000000], 2]] as [Write, unknown[], number][])
  ('encodes %s from the selected account with its exact GEN purse, then reloads finalized views', async (method, args, valueGen) => {
    const { config, calls, provider } = offline(method);
    const progress: Progress[] = [];
    await createStudioAdapter(config).write(method, args, valueGen, event => progress.push(event));
    const sends = provider.request.mock.calls.filter(([request]) => request.method === 'eth_sendTransaction');
    expect(sends).toHaveLength(1);
    const transaction = (sends[0][0] as { params: { from: string; to: string; value: string; data: `0x${string}` }[] }).params[0];
    expect(transaction.from.toLowerCase()).toBe(account);
    expect(transaction.to.toLowerCase()).toBe(studioDevnet.consensusMainContract!.address.toLowerCase());
    // Test-only policy: 100 leader units + five validators * 200 units,
    // with SDK price-cap headroom rounding the fixture's price of 1 up to 2.
    // The application purse and protocol deposit are separate SDK ABI fields.
    expect(BigInt(transaction.value)).toBe(BigInt(valueGen) * 10n ** 18n + 2200n);
    const decoded = decodeFunctionData({ abi: studioDevnet.consensusMainContract!.abi as Abi, data: transaction.data });
    expect(decoded.functionName).toBe('addTransaction');
    const parameters = decoded.args![0] as { sender: string; recipient: string; userValue: bigint };
    expect(parameters.sender.toLowerCase()).toBe(account);
    expect(parameters.recipient.toLowerCase()).toBe(contractAddress);
    expect(parameters.userValue).toBe(BigInt(valueGen) * 10n ** 18n);
    expect(progress.map(event => event.stage)).toEqual(['Signing', 'Submitted', 'Accepted', 'Finalized']);
    expect(calls.every(call => call.url === config.rpcUrl)).toBe(true);
    expect(calls.filter(call => call.method === 'gen_call').every(call => (call.params[0] as { transaction_hash_variant: string }).transaction_hash_variant === 'latest-final')).toBe(true);
    expect(calls.filter(call => call.method === 'gen_call').length).toBeGreaterThanOrEqual(3);
    expect(provider.request.mock.calls.some(([request]) => request.method === 'gen_call')).toBe(false);
  });
  it('reads real-SDK canonical views and maps only the product amendment action', async () => {
    const { config, canonical } = offline('ratify');
    const adapter = createStudioAdapter(config);
    expect(await adapter.charter('CD-test')).toEqual(canonical);
    expect(await adapter.list(account)).toEqual([canonical]);
    expect(await adapter.actions('CD-test', '', account)).toEqual(['amend']);
  });
  it('does not finalize a terminal failed execution or reload optimistic state', async () => {
    const { config, calls } = offline('ratify', 'ERROR');
    const progress: Progress[] = [];
    await expect(createStudioAdapter(config).write('ratify', ['CD-test', 'digest'], 0, event => progress.push(event))).rejects.toThrow('execution failed');
    expect(progress.at(-1)?.stage).toBe('Failed');
    expect(calls.some(call => call.method === 'gen_call')).toBe(false);
  });
  it('validates addresses and absence/disconnect before SDK signing', async () => {
    const { config, provider } = offline('ratify');
    expect(() => createStudioAdapter({ ...config, contractAddress: 'undefined' })).toThrow('contract address');
    expect(() => createStudioAdapter({ ...config, account: 'undefined' })).toThrow('wallet address');
    await expect(createStudioAdapter({ ...config, account: undefined, provider: undefined }).write('ratify', ['CD-test', 'digest'], 0, vi.fn())).rejects.toThrow('connect a wallet');
    expect(provider.request).not.toHaveBeenCalled();
  });
  it('rebinds to a changed selected account and rejects an old account before sending', async () => {
    const { config, provider } = offline('ratify');
    provider.request.mockImplementation(async ({ method }) => method === 'wallet_switchEthereumChain' ? null : method === 'eth_chainId' ? '0xf22d' : [peer]);
    await expect(createStudioAdapter(config).write('ratify', ['CD-test', 'digest'], 0, vi.fn())).rejects.toThrow('account changed');
    expect(provider.request.mock.calls.some(([request]) => request.method === 'eth_sendTransaction')).toBe(false);
  });
  it('refuses a missing measured profile before any provider transaction', async () => {
    const { config, provider } = offline('ratify');
    await expect(createStudioAdapter({ ...config, feeProfiles: { version: 1, network: 'studio-dev', methods: {} } }).write('ratify', ['CD-test', 'digest'], 0, vi.fn())).rejects.toThrow('measured Studio Dev');
    expect(provider.request.mock.calls.some(([request]) => request.method === 'eth_sendTransaction')).toBe(false);
  });
});
