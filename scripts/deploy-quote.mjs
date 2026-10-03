// Read-only deployment quote. Print only allowlisted fee/budget fields.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { abi } from 'genlayer-js';
import { authorizedActors, verifyNetwork, rpc, gen, projectRoot, saveEvidence } from './network.mjs';
export async function deployQuote() {
  await verifyNetwork();
  const [actor] = await authorizedActors();
  const code = await readFile(path.join(projectRoot, 'contracts/consent_delta.py'), 'utf8');
  const data = abi.transactions.serialize([code, abi.calldata.encode(abi.calldata.makeCalldataObject(undefined, [])), false]);
  const quote = await rpc('sim_estimateTransactionFees', [{ type: 'deploy', from: actor.account.address, to: `0x${'00'.repeat(20)}`, data }]);
  const preset = quote.recommendedPreset;
  const output = { at: new Date().toISOString(), command: 'node scripts/deploy-quote.mjs', signed: false,
    hasRecommendedPreset: Boolean(preset), protocolDepositGEN: preset?.feeValue === undefined ? null : gen(preset.feeValue),
    leaderTimeunits: preset?.distribution?.leaderTimeunitsAllocation ?? null, validatorTimeunits: preset?.distribution?.validatorTimeunitsAllocation ?? null,
    executionBudgetGEN: preset?.distribution?.executionBudgetPerRound === undefined ? null : gen(preset.distribution.executionBudgetPerRound),
    messageBudgetGEN: preset?.distribution?.totalMessageFees === undefined ? null : gen(preset.distribution.totalMessageFees) };
  await saveEvidence('deploy-quote.json', output);
  return { code, actor, preset, output };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { const {output}=await deployQuote(); console.log(JSON.stringify(output)); if(!output.hasRecommendedPreset) process.exitCode=1; }
  catch { console.error('Read-only deployment estimate failed; raw RPC/configuration is not logged.'); process.exitCode=1; }
}
