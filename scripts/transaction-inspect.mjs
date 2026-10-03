// Read-only schema/receipt inspection; never exports complete RPC payloads.
import {readFile} from 'node:fs/promises';
import {rpc,saveEvidence,gen} from './network.mjs';
import {safeReceipt} from './receipt.mjs';
import {feeObservation,transferHashes} from './fee-observation.mjs';
async function main(){
const lifecycle=JSON.parse(await readFile('docs/evidence/studio-dev/lifecycle.json','utf8'));
const label=process.argv[2];
if(!/^[a-zA-Z0-9_-]{1,60}$/.test(label??''))throw new Error('A saved lifecycle label is required.');
const step=lifecycle.steps.find(item=>item.label===label);if(!step?.hash)throw new Error('Saved hash unavailable.');
const raw=await rpc('eth_getTransactionByHash',[step.hash]);
const studio=await rpc('gen_getStudioTransactionByHash',[step.hash,true]);
const output={command:`node scripts/transaction-inspect.mjs ${label}`,network:lifecycle.network,address:lifecycle.address,receipt:safeReceipt(raw),childHashes:transferHashes(raw),rootFields:Object.keys(raw),consensusFields:Object.keys(raw.consensus_data??{}),triggeredType:typeof raw.triggered_transactions,triggeredEntryFields:Array.isArray(raw.triggered_transactions)?raw.triggered_transactions.map(item=>typeof item==='object'?Object.keys(item):typeof item):[],feeMeasured:Boolean(feeObservation(raw))};
const measurement=feeObservation(raw);
const shape=(value,depth=0)=>value&&typeof value==='object'&&depth<3?Object.fromEntries(Object.entries(value).slice(0,12).map(([key,item])=>[key,shape(item,depth+1)])):typeof value;
output.messageShape=shape(raw.messages);
output.studioRootFields=Object.keys(studio);
output.studioChildHashes=transferHashes(studio);
output.studioTriggeredShape=shape(studio.triggered_transactions);
if(measurement)output.measuredBudget={executionGEN:gen(measurement.executionBudgetPerRound),messageGEN:gen(measurement.totalMessageFees)};
await saveEvidence(`inspection-${label}.json`,output);console.log(JSON.stringify(output));
}
main().catch(()=>{console.error('Read-only transaction inspection unavailable; raw SDK/RPC errors are suppressed.');process.exitCode=1;});
