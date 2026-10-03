// Current production-source constructor simulation; no transaction broadcast.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { abi } from 'genlayer-js';
import { rpc, verifyNetwork, authorizedActors, projectRoot, saveEvidence } from './network.mjs';
try {
  const network = await verifyNetwork();
  const [actor] = await authorizedActors();
  const code = await readFile(path.join(projectRoot, 'contracts/consent_delta.py'), 'utf8');
  const data = abi.transactions.serialize([code, abi.calldata.encode(abi.calldata.makeCalldataObject(undefined, [])), false]);
  const receipt = await rpc('sim_call', [{ type: 'deploy', from: actor.account.address, to: `0x${'00'.repeat(20)}`, data }]);
  const output = { at: new Date().toISOString(), command: 'node scripts/smoke.mjs', network, signed: false, execution: receipt?.execution_result ?? null, mode: receipt?.mode ?? null, passed: receipt?.execution_result === 'SUCCESS' };
  await saveEvidence('constructor-simulation.json', output);
  console.log(JSON.stringify(output));
  if (!output.passed) process.exitCode = 1;
} catch { console.error('Bounded constructor simulation failed; raw receipt/configuration is not logged.'); process.exitCode = 1; }
