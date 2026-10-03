import { createClient } from 'genlayer-js';
import { CalldataAddress, TransactionHashVariant } from 'genlayer-js/types';
import { hexToBytes, keccak256 } from 'viem';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { network, chain, verifyNetwork, authorizedActors, rpc, projectRoot, gen, saveEvidence } from './network.mjs';
import { safeReceipt } from './receipt.mjs';
import { writeQuote } from './write-quote.mjs';
import { feeObservation, transferHashes } from './fee-observation.mjs';
import { explorerRelations, nativeReceipt } from './native-transfer.mjs';
const file=path.join(projectRoot,'docs/evidence/studio-dev/lifecycle.json');
const GEN=10n**18n;
const addr=value=>new CalldataAddress(hexToBytes(value));
const id='CD-live-035';
const old=['A may read the shared research dataset.','B may redistribute the shared research dataset without paying a fee.','C must publish attribution when using the shared research dataset.'];
const initialChanged=[old[0],'B may redistribute the shared research dataset only after paying a fee to the group.',old[2]];
let evidence;
let deployment;
let actors;
const reads=createClient({chain});
const view=async(method,args)=>JSON.parse(await reads.readContract({address:deployment.address,functionName:method,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL}));
const snapshot=async(cid,pid,actor)=>{
  const result={};
  try{result.charter=await view('get_charter',[cid]);result.accounting=await view('get_accounting',[cid]);}catch{result.absent=true;}
  if(pid)try{result.proposal=await view('get_proposal',[cid,pid]);}catch{result.proposalAbsent=true;}
  if(actor)result.actorBalanceGEN=gen(await rpc('eth_getBalance',[actor.account.address,'latest']));
  result.contractBalanceGEN=gen(await rpc('eth_getBalance',[deployment.address,'latest']));
  return result;
};
async function persist(){await saveEvidence('lifecycle.json',evidence);}
function assert(value,message){if(!value)throw new Error(message);}
async function finalize(step){
  let previous;
  for(let attempt=0;attempt<180;attempt++){
    const raw=await rpc('eth_getTransactionByHash',[step.hash]);const state=safeReceipt(raw);
    if(state.status!==previous){console.log(JSON.stringify({step:step.label,...state}));previous=state.status;step.statuses??=[];step.statuses.push({at:new Date().toISOString(),...state});await persist();}
    if(state.failed){step.failed=true;await persist();throw new Error('A lifecycle transaction failed; inspect before continuing.');}
    if(state.successful){step.receipt=state;step.finalizedAt=new Date().toISOString();step.feeObservation=feeObservation(raw);step.childHashes=transferHashes(raw);await persist();return raw;}
    await new Promise(resolve=>setTimeout(resolve,3000));
  }
  throw new Error('A lifecycle transaction remains pending; resume its hash without replay.');
}
async function transact(label,role,method,args,cid=id,pid='',value=0){
  let step=evidence.steps.find(value=>value.label===label);
  if(step?.completed&&step.after?.charter&&step.after?.accounting){console.log(JSON.stringify({step:label,recovered:true,hash:step.hash}));return step;}
  const actor=actors.find(value=>value.role===role);
  if(step?.hash){await finalize(step);step.after=await snapshot(cid,pid,actor);assert(step.after.charter&&step.after.accounting&&(!pid||step.after.proposal),'Finalized transaction needs canonical after-state before completion.');step.completed=true;await persist();return step;}
  const original=actor.account.signTransaction;
  const account={...actor.account,signTransaction:async(...params)=>{
    const signed=await original(...params);step.hash=keccak256(signed);step.status='SUBMITTED_OR_SIGNED';
    await mkdir(path.join(projectRoot,'.local/signed'),{recursive:true});await writeFile(path.join(projectRoot,'.local/signed',label+'.txt'),signed);await persist();
    console.log(JSON.stringify({step:label,hash:step.hash,applicationPurseGEN:value}));return signed;
  }};
  const client=createClient({chain,account});
  const quote=await writeQuote({address:deployment.address,from:actor.account.address,method,args,value:BigInt(value)*GEN});
  assert(quote.feeValue<=GEN/10n,'Protocol deposit exceeds the 0.1 GEN per-step smoke budget.');
  step={label,role,actor:actor.account.address,method,applicationPurseGEN:value,protocolDepositGEN:gen(quote.feeValue),before:await snapshot(cid,pid,actor)};
  evidence.steps.push(step);await persist();
  try{const hash=await client.writeContract({address:deployment.address,functionName:method,args,value:BigInt(value)*GEN,fees:{distribution:quote.distribution,feeValue:quote.feeValue,...(quote.messageAllocations?{messageAllocations:quote.messageAllocations}:{})}});assert(hash===step.hash,'SDK/hash mismatch.');}
  catch{if(!step.hash)throw new Error('Stopped before signing; no transaction replay is authorized automatically.');console.log(JSON.stringify({step:label,hash:step.hash,message:'Inspect saved hash after SDK transport error.'}));}
  await finalize(step);step.after=await snapshot(cid,pid,actor);assert(step.after.charter&&step.after.accounting&&(!pid||step.after.proposal),'Finalized transaction needs canonical after-state before completion.');step.completed=true;await persist();return step;
}
async function requireState(cid,phase,version){const charter=await view('get_charter',[cid]);assert(charter.phase===phase&&charter.version===version,'Canonical charter phase/version mismatch.');return charter;}
async function proposal(cid,pid){return view('get_proposal',[cid,pid]);}
async function waitUntil(deadline){
  // Preview waits use local time only; the recovery method independently checks
  // canonical transaction time and must still reject an early transaction.
  console.log(JSON.stringify({waitingForDeadline:new Date(deadline*1000).toISOString()}));
  while(Math.floor(Date.now()/1000)<deadline+2)await new Promise(resolve=>setTimeout(resolve,2000));
}
async function withdraw(label,cid){
  const step=await transact(label,'A','withdraw',[cid],cid);
  // Exact decimal GEN parsing below preserves every native balance digit.
  const units=value=>{const [whole,fraction='']=value.split('.');return BigInt(whole)*GEN+BigInt(fraction.padEnd(18,'0'));};
  if(step.nativeTransferProof?.childReceipt){
    const prior=step.nativeTransferProof;
    assert(units(step.before.contractBalanceGEN)-units(prior.after.contractBalanceGEN)===2n*GEN,'Saved native balance proof is inconsistent.');
    const relations=await explorerRelations(step.hash);
    assert(relations.triggeredTransactions?.length===1,'Saved withdrawal child is unavailable.');
    const child=nativeReceipt(relations.triggeredTransactions[0],{parent:step.hash,sender:deployment.address,recipient:actors[0].account.address,amount:2n*GEN});
    assert(child.hash===prior.childReceipt.hash,'Withdrawal child identity changed.');
    console.log(JSON.stringify({step:label,nativeChildRecovered:true,childHash:child.hash,valueGEN:'2'}));
    return step;
  }
  let current=await snapshot(cid,'',actors[0]);
  for(let attempt=0;attempt<60&&units(step.before.contractBalanceGEN)-units(current.contractBalanceGEN)!==2n*GEN;attempt++){
    await new Promise(resolve=>setTimeout(resolve,2000));current=await snapshot(cid,'',actors[0]);
  }
  assert(units(step.before.contractBalanceGEN)-units(current.contractBalanceGEN)===2n*GEN,'Native contract balance did not decrease by exactly 2 GEN.');
  assert(current.accounting.credits_gen===0&&current.accounting.locked_gen===0&&current.accounting.conserved,'Withdrawal accounting is not closed.');
  const relations=await explorerRelations(step.hash);
  assert(relations.triggeredTransactions?.length===1,'Expected exactly one native child receipt.');
  const child=nativeReceipt(relations.triggeredTransactions[0],{parent:step.hash,sender:deployment.address,recipient:actors[0].account.address,amount:2n*GEN});
  assert(units(current.actorBalanceGEN)>units(step.before.actorBalanceGEN),'Native recipient balance did not increase after fees.');
  step.nativeTransferProof={childReceipt:child,contractDecreaseGEN:'2',recipient:actors[0].account.address,recipientBalanceBeforeGEN:step.before.actorBalanceGEN,recipientBalanceAfterGEN:current.actorBalanceGEN,after:current};
  await persist();return step;
}
async function main(){
  await verifyNetwork();actors=await authorizedActors();deployment=JSON.parse(await readFile(path.join(projectRoot,'docs/evidence/studio-dev/deployment.json'),'utf8'));
  assert(deployment.status==='ACTIVE'&&deployment.network===network.name,'Active deployment missing.');
  try{evidence=JSON.parse(await readFile(file,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;evidence={network:network.name,chainId:network.chainId,address:deployment.address,sourceCommit:deployment.sourceCommit,startedAt:new Date().toISOString(),steps:[],status:'IN_PROGRESS'};}
  assert(evidence.address===deployment.address,'Lifecycle deployment mismatch.');
  if(process.argv.includes('--inspect')){console.log(JSON.stringify({status:evidence.status,steps:evidence.steps.map(step=>({label:step.label,hash:step.hash,completed:step.completed})),canonical:await snapshot(id,'',actors[0])}));return;}
  assert(process.argv.includes('--run'),'Use --inspect before --run.');
  evidence.activationDeadline??=Math.floor(Date.now()/1000)+21600;await persist();
  await transact('create','A','create_charter',[id,'Shared research charter',addr(actors[1].account.address),addr(actors[2].account.address),...old,BigInt(evidence.activationDeadline)]);
  let charter=await view('get_charter',[id]);
  evidence.baselineDigest??=charter.digest;await persist();
  for(const role of ['A','B','C'])await transact('ratify-'+role,role,'ratify',[id,evidence.baselineDigest]);
  if(!evidence.steps.some(step=>step.label==='propose-adopt'&&step.completed)) await requireState(id,'ACTIVE',1);
  evidence.adoptDeadline??=Math.floor(Date.now()/1000)+21600;await persist();
  await transact('propose-adopt','A','propose_amendment',[id,'AM-adopt',1n,evidence.baselineDigest,...initialChanged,BigInt(evidence.adoptDeadline)],id,'AM-adopt',2);
  await transact('review-adopt','C','review',[id,'AM-adopt'],id,'AM-adopt');
  let amendment=await proposal(id,'AM-adopt');
  if(!evidence.steps.some(step=>step.label==='consent-B'&&step.completed)) {
    assert(amendment.phase==='CONSENT_REQUIRED'&&amendment.required.join()==='B','Expected affected member B; inspect real verdict instead of forcing it.');
    evidence.unaffectedActions=await view('get_actions',[id,'AM-adopt',addr(actors[2].account.address)]);
    assert(!evidence.unaffectedActions.includes('consent')&&!evidence.unaffectedActions.includes('reject'),'Unaffected member has a veto.');
  }
  await transact('consent-B','B','consent',[id,'AM-adopt',amendment.digest],id,'AM-adopt');
  await requireState(id,'ACTIVE',2);assert((await proposal(id,'AM-adopt')).phase==='ADOPTED','Adoption not canonical.');
  await withdraw('withdraw-adopt',id);
  evidence.refusalBaseDigest??=(await view('get_charter',[id])).digest;
  evidence.refusalDeadline??=Math.floor(Date.now()/1000)+21600;await persist();
  const furtherChanged=[initialChanged[0],initialChanged[1]+' B must also publish a usage report every week.',initialChanged[2]];
  await transact('propose-refuse','A','propose_amendment',[id,'AM-refuse',2n,evidence.refusalBaseDigest,...furtherChanged,BigInt(evidence.refusalDeadline)],id,'AM-refuse',2);
  await transact('review-refuse','C','review',[id,'AM-refuse'],id,'AM-refuse');
  const refusal=await proposal(id,'AM-refuse');
  if(!evidence.steps.some(step=>step.label==='reject-B'&&step.completed))assert(refusal.phase==='CONSENT_REQUIRED'&&refusal.required.join()==='B','Inspect the real refusal verdict before proceeding.');
  await transact('reject-B','B','reject',[id,'AM-refuse',refusal.digest],id,'AM-refuse');
  await requireState(id,'ACTIVE',2);assert((await proposal(id,'AM-refuse')).phase==='REJECTED','Refusal is not canonical.');
  await withdraw('withdraw-refuse',id);
  evidence.expiryDeadline??=Math.floor(Date.now()/1000)+120;await persist();
  await transact('propose-expire','A','propose_amendment',[id,'AM-expire',2n,evidence.refusalBaseDigest,...furtherChanged,BigInt(evidence.expiryDeadline)],id,'AM-expire',2);
  if(!evidence.steps.some(step=>step.label==='expire-proposal'&&step.completed)){
    assert((await proposal(id,'AM-expire')).phase==='REVIEWABLE','Expiry test must deliberately leave phase stale.');
    await waitUntil(evidence.expiryDeadline);
  }
  await transact('expire-proposal','C','expire',[id,'AM-expire'],id,'AM-expire');
  await requireState(id,'ACTIVE',2);assert((await proposal(id,'AM-expire')).phase==='EXPIRED','Expiry is not canonical.');
  await withdraw('withdraw-expire',id);
  const draft='CD-expire-035';
  evidence.draftDeadline??=Math.floor(Date.now()/1000)+90;await persist();
  await transact('create-draft','A','create_charter',[draft,'Unratified research charter',addr(actors[1].account.address),addr(actors[2].account.address),...old,BigInt(evidence.draftDeadline)],draft);
  if(!evidence.steps.some(step=>step.label==='expire-charter'&&step.completed))await waitUntil(evidence.draftDeadline);
  await transact('expire-charter','C','expire_charter',[draft],draft);
  await requireState(draft,'EXPIRED',1);
  const final=await snapshot(id,'AM-expire',actors[0]);
  assert(final.contractBalanceGEN==='0'&&final.accounting.funded_gen===6&&final.accounting.withdrawn_gen===6&&final.accounting.conserved,'Final native GEN/accounting closure failed.');
  evidence.status='ALL_METHODS_LIFECYCLE_AND_NATIVE_WITHDRAWALS_VERIFIED';await persist();console.log(JSON.stringify({status:evidence.status,completedSteps:evidence.steps.length,canonical:final}));
}
main().catch(()=>{console.error('Lifecycle acceptance failed or is pending. Inspect canonical views and saved transaction hashes; no raw receipt/configuration or secret is logged.');process.exitCode=1;});
