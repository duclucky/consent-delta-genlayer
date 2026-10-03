// Local archive only after read-only proof that this broken revision holds no GEN.
import { readFile, mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { network, rpc, verifyNetwork, projectRoot, saveEvidence, gen } from './network.mjs';
async function main(){
await verifyNetwork();
const identity = JSON.parse(await readFile(path.join(projectRoot, 'docs/evidence/studio-dev/deployment.json'), 'utf8'));
if(identity.network !== network.name || identity.status !== 'ACTIVE') throw new Error('Expected the active broken Studio Dev revision.');
const diagnosis = JSON.parse(await readFile(path.join(projectRoot, 'docs/evidence/studio-dev/create-diagnosis.json'), 'utf8'));
const probe = JSON.parse(await readFile(path.join(projectRoot, 'docs/evidence/studio-dev/clock-probe.json'), 'utf8'));
if(diagnosis.safeTerminalReason !== 'SystemError: 2: inval' || !probe.results.some(item => item.name === 'message-clock' && item.execution === 'SUCCESS')) throw new Error('Clock diagnosis and replacement feasibility are not verified.');
const balance = BigInt(await rpc('eth_getBalance', [identity.address, 'latest']));
if(balance !== 0n) throw new Error('This bounded archive requires zero native GEN.');
const lifecycle = JSON.parse(await readFile(path.join(projectRoot, 'docs/evidence/studio-dev/lifecycle.json'), 'utf8'));
if(lifecycle.address !== identity.address || lifecycle.steps.length !== 0) throw new Error('Inspect existing lifecycle transactions before archiving.');
const name = identity.address.toLowerCase();
await mkdir(path.join(projectRoot, 'docs/evidence/studio-dev/revisions'), {recursive: true});
identity.status = 'ABANDONED_BROKEN';
identity.reason = 'Pinned runner GetTimestamp host call fails before charter creation. Replacement uses canonical message datetime; no further value or writes to this revision.';
identity.archivedAt = new Date().toISOString();
identity.recovery = {nativeBalanceGEN: gen(balance), lifecycleWrites: 0, orphanedGEN: '0', diagnosis: 'create-diagnosis.json', replacementProbe: 'clock-probe.json'};
await saveEvidence('deployment.json', identity);
await rename(path.join(projectRoot, 'docs/evidence/studio-dev/deployment.json'), path.join(projectRoot, `docs/evidence/studio-dev/revisions/${name}.json`));
await rename(path.join(projectRoot, 'docs/evidence/studio-dev/lifecycle.json'), path.join(projectRoot, `docs/evidence/studio-dev/revisions/${name}-lifecycle.json`));
console.log(JSON.stringify({status: identity.status, address: identity.address, nativeBalanceGEN: '0', lifecycleWrites: 0, archived: true}));
}
main().catch(()=>{console.error('Broken-revision archive stopped; inspect the identity and native balance. Raw SDK/RPC errors are suppressed.');process.exitCode=1;});
