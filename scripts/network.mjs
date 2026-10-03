import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { privateKeyToAccount } from 'viem/accounts';
import { formatUnits } from 'viem';
import { studioDevnet } from 'genlayer-js/chains';
export const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const network = { name: 'studio-dev', chainId: 61997, icRpc: 'https://studio-next.genlayer.com/api', walletRpc: studioDevnet.rpcUrls.default.http[0], explorer: 'https://explorer-studio-dev.genlayer.com' };
export const chain = { ...studioDevnet, rpcUrls: { default: { http: [network.icRpc] } } };
export const gen = amount => formatUnits(BigInt(amount), 18);
export async function rpc(method, params = [], endpoint = network.icRpc) {
  const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new Error(`Studio Dev HTTP ${response.status}`);
  const envelope = await response.json();
  if (envelope.error) throw new Error(`Studio Dev RPC ${Number.isInteger(envelope.error.code) ? envelope.error.code : 'failed'}`);
  return envelope.result;
}
export async function authorizedActors() {
  const files = [path.join(projectRoot, '.env'), path.join(path.dirname(projectRoot), '.env')];
  const variables = {};
  for (const file of files) {
    try { const values = parseEnv(await readFile(file, 'utf8')); for (const key of ['STUDIONET_PRIVATE_KEY', 'STUDIONET_INTEGRATOR_PRIVATE_KEY', 'STUDIONET_STEWARD_PRIVATE_KEY']) if (!variables[key] && values[key]?.trim()) variables[key] = values[key].trim(); }
    catch (error) { if (error.code !== 'ENOENT') throw new Error('Authorized environment could not be read.'); }
  }
  return ['STUDIONET_PRIVATE_KEY', 'STUDIONET_INTEGRATOR_PRIVATE_KEY', 'STUDIONET_STEWARD_PRIVATE_KEY'].map((key, index) => {
    if (!variables[key] || !/^(0x)?[0-9a-fA-F]{64}$/.test(variables[key])) throw new Error(`Authorized actor ${index + 1} is not configured.`);
    const secret = variables[key].startsWith('0x') ? variables[key] : `0x${variables[key]}`;
    return { role: ['A', 'B', 'C'][index], account: privateKeyToAccount(secret) };
  });
}
export async function verifyNetwork() {
  if (studioDevnet.id !== network.chainId || studioDevnet.nativeCurrency.symbol !== 'GEN') throw new Error('SDK/network mismatch.');
  const ic = await rpc('eth_chainId');
  const wallet = await rpc('eth_chainId', [], network.walletRpc);
  if (BigInt(ic) !== BigInt(network.chainId) || BigInt(wallet) !== BigInt(network.chainId)) throw new Error('Live RPC/network mismatch.');
  return { chainId: network.chainId, icRpc: network.icRpc, walletRpc: network.walletRpc, consensus: studioDevnet.consensusMainContract.address };
}
export async function saveEvidence(filename, value) {
  const directory = path.join(projectRoot, 'docs/evidence/studio-dev'); await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), JSON.stringify(value, null, 2) + '\n');
}
