// Read-only network refresh, local profile output. No transaction signing.
import {readFile} from 'node:fs/promises';
import {rpc,saveEvidence,gen} from './network.mjs';
import {feeObservation} from './fee-observation.mjs';
import {safeReceipt} from './receipt.mjs';
async function main(){
const lifecycle=JSON.parse(await readFile('docs/evidence/studio-dev/lifecycle.json','utf8'));
const methods={},evidence=[];
for(const step of lifecycle.steps){
 if(!step.completed)continue;
 const raw=await rpc('eth_getTransactionByHash',[step.hash]);
 if(!safeReceipt(raw).successful)throw new Error('Profile source is not a finalized successful transaction.');
 const measurement=feeObservation(raw);if(!measurement)throw new Error('A complete five-field measurement is required.');
 methods[step.method]??={};
 for(const[key,value]of Object.entries(measurement)){
  // Fifty percent integer headroom; rotations retain the measured round count.
  const bound=key==='rotationsPerRound'?BigInt(value):(BigInt(value)*15000n+9999n)/10000n;
  if(bound>BigInt(methods[step.method][key]??0))methods[step.method][key]=String(bound);
  else methods[step.method][key]??='0';
 }
 evidence.push({method:step.method,hash:step.hash,executionBudgetGEN:gen(measurement.executionBudgetPerRound),messageBudgetGEN:gen(measurement.totalMessageFees)});
}
const required=['create_charter','ratify','propose_amendment','review','consent','reject','expire','expire_charter','withdraw'];
const missing=required.filter(method=>!methods[method]);
const profile={version:1,network:lifecycle.network,chainId:lifecycle.chainId,address:lifecycle.address,sourceCommit:lifecycle.sourceCommit,measuredAt:new Date().toISOString(),headroomBps:15000,methods};
await saveEvidence('fee-profile.json',profile);
await saveEvidence('fee-profile-evidence.json',{command:'node scripts/fee-profile.mjs',requiredMethods:required,measuredMethods:Object.keys(methods),missingMethods:missing,signed:false,evidence});
console.log(JSON.stringify({measuredMethods:Object.keys(methods).length,missingMethods:missing,headroomBps:15000,observations:evidence.length,signed:false}));
if(missing.length)process.exitCode=1;
}
main().catch(()=>{console.error('Read-only fee profiling incomplete; raw SDK/RPC errors are suppressed.');process.exitCode=1;});
