import { createClient } from 'genlayer-js';
import { studioDevnet } from 'genlayer-js/chains';
import { CalldataAddress, TransactionHashVariant, type CalldataEncodable, type FeeEstimateOptions } from 'genlayer-js/types';
import { formatUnits, hexToBytes } from 'viem';
import { safeReceipt } from '../../scripts/receipt.mjs';
import { labels, unavailableAdapter, validAddress, type Address, type Charter, type ContractAdapter, type Credit, type Proposal, type Write } from './adapter';
import type { Provider } from './wallet';

export const walletChain = {
  chainId: `0x${studioDevnet.id.toString(16)}`, chainName: studioDevnet.name,
  nativeCurrency: studioDevnet.nativeCurrency, rpcUrls: [...studioDevnet.rpcUrls.default.http],
  blockExplorerUrls: ['https://explorer-studio-dev.genlayer.com'],
};
export async function switchStudioNetwork(provider: Provider): Promise<void> {
  try { await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: walletChain.chainId }] }); }
  catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    if (code !== 4902 && code !== -32603) throw new Error('The Studio Dev network switch was not approved.');
    await provider.request({ method: 'wallet_addEthereumChain', params: [walletChain] });
    await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: walletChain.chainId }] });
  }
  const current = await provider.request({ method: 'eth_chainId' });
  if (typeof current !== 'string' || BigInt(current) !== BigInt(studioDevnet.id)) throw new Error('Your selected wallet is not on Studio Dev.');
}
type Profile = { leaderTimeunitsAllocation: string; validatorTimeunitsAllocation: string; executionBudgetPerRound: string; totalMessageFees: string; rotationsPerRound: string };
export type FeeProfiles = { version: number; network: string; methods: Partial<Record<Write, Profile>> };
type Config = { contractAddress?: string; account?: string; provider?: Provider; rpcUrl?: string; feeProfiles?: FeeProfiles; pollIntervalMs?: number };
const GEN = 10n ** 18n;
const asAddress = (value: string) => { if (!validAddress(value)) throw new Error('A valid wallet address is required.'); return new CalldataAddress(hexToBytes(value)); };
function calldata(value: unknown): CalldataEncodable {
  if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'bigint' || value === null) return value;
  if (typeof value === 'number' && Number.isSafeInteger(value)) return BigInt(value);
  throw new Error('The action contains an invalid argument.');
}
function quotedProfile(profile: Profile): FeeEstimateOptions {
  const numbers = Object.values(profile);
  if (numbers.length !== 5 || numbers.some(value => !/^\d+$/.test(value))) throw new Error('The measured fee profile is invalid.');
  return { leaderTimeunitsAllocation: BigInt(profile.leaderTimeunitsAllocation), validatorTimeunitsAllocation: BigInt(profile.validatorTimeunitsAllocation),
    executionBudgetPerRound: BigInt(profile.executionBudgetPerRound), totalMessageFees: BigInt(profile.totalMessageFees),
    appealRounds: 0n, rotations: [BigInt(profile.rotationsPerRound)] };
}

export function createStudioAdapter(config: Config): ContractAdapter {
  const { contractAddress, account, provider } = config;
  if (!contractAddress) return unavailableAdapter;
  if (!validAddress(contractAddress)) throw new Error('The deployed Studio Dev contract address is invalid.');
  if (account !== undefined && !validAddress(account)) throw new Error('The selected wallet address is invalid.');
  if (studioDevnet.id !== 61997 || studioDevnet.nativeCurrency.symbol !== 'GEN' || !studioDevnet.consensusMainContract || !validAddress(studioDevnet.consensusMainContract.address)) throw new Error('The installed SDK has an incompatible Studio Dev chain definition.');
  const rpcUrl = config.rpcUrl ?? new URL('/genlayer-rpc', window.location.origin).href;
  // Clone the chain: createClient(endpoint) mutates its chain object in this RC.
  const chain = { ...studioDevnet, rpcUrls: { default: { http: [rpcUrl] } } };
  const reads = createClient({ chain });
  const rpc = async (method: string, params: unknown[]) => {
    const response = await fetch(rpcUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }) });
    if (!response.ok) throw new Error('Studio Dev is unavailable.');
    const body = await response.json();
    if (body.error) throw new Error('Studio Dev could not read the transaction state.');
    return body.result;
  };
  const read = async <T,>(functionName: string, args: CalldataEncodable[]): Promise<T> => {
    const result = await reads.readContract({ address: contractAddress, functionName, args, transactionHashVariant: TransactionHashVariant.LATEST_FINAL });
    if (typeof result !== 'string') throw new Error('The canonical contract view has an unexpected format.');
    return JSON.parse(result) as T;
  };
  const charter = async (id: string) => {
    const value = await read<Charter>('get_charter', [id]);
    if (value?.id !== id || !(value.phase in labels) || value.members?.length !== 3) throw new Error('The canonical charter is invalid.');
    return value;
  };
  const proposal = (id: string, amendment: string) => read<Proposal>('get_proposal', [id, amendment]);
  return {
    configured: true, charter, proposal,
    list: who => read<Charter[]>('get_charters', [asAddress(who)]),
    actions: async (id, amendment, who) => (await read<string[]>('get_actions', [id, amendment, asAddress(who)])).map(action => action === 'propose_amendment' ? 'amend' : action),
    credits: who => read<Credit[]>('get_credits', [asAddress(who)]),
    async write(method, args, valueGen, progress) {
      if (!account || !provider) throw new Error('Choose and connect a wallet before signing.');
      if (!Number.isSafeInteger(valueGen) || valueGen !== (method === 'propose_amendment' ? 2 : 0)) throw new Error('This action has an invalid GEN purse.');
      const encoded = args.map(calldata);
      if (method === 'create_charter') {
        if (typeof args[2] !== 'string' || typeof args[3] !== 'string') throw new Error('Both peer addresses are required.');
        encoded[2] = asAddress(args[2]); encoded[3] = asAddress(args[3]);
      }
      await switchStudioNetwork(provider);
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (!Array.isArray(accounts) || !accounts.some(value => typeof value === 'string' && value.toLowerCase() === account.toLowerCase())) throw new Error('The selected wallet account changed. Reconnect before signing.');
      let submitted: string | undefined;
      const writes = createClient({ chain, account: account as Address, provider: { request: async (request: { method: string; params?: unknown[] }) => {
        const result = await provider.request(request);
        if (request.method === 'eth_sendTransaction' && typeof result === 'string' && /^0x[0-9a-fA-F]{64}$/.test(result)) {
          submitted = result; progress({ stage: 'Submitted', hash: result });
        }
        return result;
      } } });
      const profiles: FeeProfiles = config.feeProfiles ?? await fetch('/fee-profile.json').then(async response => {
        if (!response.ok) throw new Error('The measured fee profile is not ready.');
        return response.json();
      });
      if (profiles.version !== 1 || profiles.network !== 'studio-dev' || !profiles.methods[method]) throw new Error('This action needs a measured Studio Dev fee profile before signing.');
      const quote = await writes.estimateTransactionFees(quotedProfile(profiles.methods[method]!));
      progress({ stage: 'Signing', message: `Application purse: ${valueGen} GEN. Quoted protocol deposit: ${formatUnits(quote.feeValue, 18)} GEN. Unused protocol budget is refunded at finalization; wallet gas is separate.` });
      let hash: unknown;
      try { hash = await writes.writeContract({ address: contractAddress, functionName: method, args: encoded,
        value: BigInt(valueGen) * GEN, fees: { distribution: quote.distribution, feeValue: quote.feeValue } }); }
      catch { progress({ stage: 'Failed', hash: submitted, message: submitted ? 'The transaction was submitted but its result could not be confirmed. Check it before retrying.' : 'The wallet did not complete this transaction.' }); throw new Error('The wallet transaction could not be confirmed.'); }
      if (typeof hash !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(hash)) throw new Error('The wallet did not return a verifiable transaction hash.');
      if (!submitted) progress({ stage: 'Submitted', hash });
      else if (hash.toLowerCase() !== submitted.toLowerCase()) throw new Error('The SDK transaction identity changed. Check the submitted hash before retrying.');
      let finalized = false;
      for (let attempt = 0; attempt < 300; attempt++) {
        const receipt = safeReceipt(await rpc('eth_getTransactionByHash', [hash]));
        if (receipt.failed) { progress({ stage: 'Failed', hash, message: 'The transaction did not finalize successfully. Reload the current charter before retrying.' }); throw new Error('Transaction execution failed.'); }
        if (receipt.successful) { finalized = true; break; }
        if (receipt.status === 'ACCEPTED') progress({ stage: 'Accepted', hash });
        await new Promise(resolve => setTimeout(resolve, config.pollIntervalMs ?? 2000));
      }
      if (!finalized) throw new Error('Finalization is still pending. Check this transaction and canonical state before retrying.');
      const id = args[0];
      if (typeof id !== 'string') throw new Error('The charter target is invalid.');
      await charter(id);
      if (['propose_amendment', 'review', 'consent', 'reject', 'expire'].includes(method) && typeof args[1] === 'string') await proposal(id, args[1]);
      await read('get_accounting', [id]);
      await read('get_credits', [asAddress(account)]);
      progress({ stage: 'Finalized', hash });
    },
  };
}
