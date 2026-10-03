// Read-only preflight. Does not sign, fund, deploy or submit a transaction.
import { execFileSync } from 'node:child_process';
import { authorizedActors, verifyNetwork, rpc, gen, saveEvidence, projectRoot } from './network.mjs';
try {
  const network = await verifyNetwork();
  const actors = await authorizedActors();
  if (new Set(actors.map(actor => actor.account.address.toLowerCase())).size !== 3) throw new Error('The lifecycle requires three distinct authorized actors.');
  const balances = [];
  for (const actor of actors) balances.push({ role: actor.role, address: actor.account.address, balanceGEN: gen(await rpc('eth_getBalance', [actor.account.address, 'latest'])) });
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: projectRoot, encoding: 'utf8' }).trim();
  const record = { at: new Date().toISOString(), command: 'node scripts/inspect.mjs', readOnly: true, network, sourceCommit, actors: balances };
  await saveEvidence('preflight.json', record);
  console.log(JSON.stringify(record));
} catch (error) { console.error(error.message.startsWith('Studio Dev') || error.message.startsWith('Authorized') || error.message.startsWith('The lifecycle') || error.message.endsWith('mismatch.') ? error.message : 'Read-only preflight failed; no secret or raw RPC data logged.'); process.exitCode = 1; }
