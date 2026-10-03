// Fresh canonical network reads and a safe public acceptance projection.
import {readFile} from 'node:fs/promises';
import {createClient} from 'genlayer-js';
import {TransactionHashVariant} from 'genlayer-js/types';
import {keccak256} from 'viem';
import {chain,network,rpc,saveEvidence,gen,verifyNetwork} from './network.mjs';
import {safeReceipt} from './receipt.mjs';
import {explorerRelations,nativeReceipt} from './native-transfer.mjs';
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
async function main(){
await verifyNetwork();
const deployment=JSON.parse(await readFile('docs/evidence/studio-dev/deployment.json','utf8'));
const lifecycle=JSON.parse(await readFile('docs/evidence/studio-dev/lifecycle.json','utf8'));
const code=await readFile('contracts/consent_delta.py','utf8');
assert(keccak256(new TextEncoder().encode(code))===deployment.sourceDigest,'Deployed source digest mismatch.');
assert(lifecycle.address===deployment.address&&lifecycle.sourceCommit===deployment.sourceCommit,'Lifecycle identity mismatch.');
const methods=new Set(),receipts=[],withdrawals=[],reviews=[];
const client=createClient({chain});
const view=async(functionName,args)=>JSON.parse(await client.readContract({address:deployment.address,functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL}));
const units=value=>{const [whole,fraction='']=value.split('.');return BigInt(whole)*10n**18n+BigInt(fraction.padEnd(18,'0'));};
for(const step of lifecycle.steps){
 assert(step.completed&&step.after?.charter&&step.after?.accounting?.conserved,'A finalized step lacks canonical after-state/accounting proof.');
 const raw=await rpc('eth_getTransactionByHash',[step.hash]);const receipt=safeReceipt(raw);
 assert(receipt.successful&&!raw.leader_only,'A parent is not finalized successful normal consensus.');
 methods.add(step.method);receipts.push({label:step.label,method:step.method,actor:step.actor,applicationPurseGEN:step.applicationPurseGEN,receipt,observedFinalizedAt:step.finalizedAt,explorer:`${network.explorer}/tx/${step.hash}`});
 if(step.method==='withdraw'){
  const relations=await explorerRelations(step.hash);assert(relations.triggeredTransactions?.length===1,'Native child count mismatch.');
  const child=nativeReceipt(relations.triggeredTransactions[0],{parent:step.hash,sender:deployment.address,recipient:step.actor,amount:2n*10n**18n});
  const proof=step.nativeTransferProof;
  assert(proof?.childReceipt?.hash===child.hash&&units(step.before.contractBalanceGEN)-units(proof.after.contractBalanceGEN)===2n*10n**18n,'Exact native contract decrease is unverified.');
  assert(units(proof.recipientBalanceAfterGEN)>units(proof.recipientBalanceBeforeGEN),'Recipient gain after fees is unverified.');
  withdrawals.push({...child,contractDecreaseGEN:'2',recipientBeforeGEN:proof.recipientBalanceBeforeGEN,recipientAfterGEN:proof.recipientBalanceAfterGEN});
 }
 if(step.method==='review'){
  const current=await view('get_proposal',['CD-live-035',step.after.proposal.id]);
  const attempt=await view('get_attempt',['CD-live-035',current.id,BigInt(current.attempt_count)]);
  assert(attempt.digest===current.digest&&attempt.base_version===current.base_version&&attempt.coverage.length===3,'Canonical review attempt binding failed.');
  reviews.push({proposal:current.id,attemptIndex:current.attempt_count,coverage:attempt.coverage,result:attempt.result,required:current.required,initialValidatorCount:raw.num_of_initial_validators,leaderOnly:false});
 }
}
assert(methods.size===9&&withdrawals.length===3,'Every write method and all three terminal withdrawal paths are required.');
assert(lifecycle.steps.find(step=>step.label==='expire-proposal')?.before.proposal.phase==='REVIEWABLE','Stale-phase expiry is unproven.');
const charter=await view('get_charter',['CD-live-035']);const accounting=await view('get_accounting',['CD-live-035']);const draft=await view('get_charter',['CD-expire-035']);
const contractBalanceGEN=gen(await rpc('eth_getBalance',[deployment.address,'latest']));
assert(charter.phase==='ACTIVE'&&charter.version===2&&draft.phase==='EXPIRED'&&contractBalanceGEN==='0'&&accounting.conserved&&accounting.funded_gen===6&&accounting.withdrawn_gen===6&&accounting.locked_gen===0&&accounting.credits_gen===0,'Canonical final closure failed.');
const output={command:'node scripts/verify-lifecycle.mjs',network:network.name,address:deployment.address,sourceCommit:deployment.sourceCommit,verifiedAt:new Date().toISOString(),status:'PASS',parentTransactions:receipts.length,nativeChildren:withdrawals.length,writeMethods:[...methods].sort(),charter:{id:charter.id,phase:charter.phase,version:charter.version,digest:charter.digest},expiredDraft:{id:draft.id,phase:draft.phase},accounting,contractBalanceGEN,receipts,withdrawals,reviews,browserWalletEvidence:'PENDING_REAL_EVIDENCE'};
await saveEvidence('lifecycle-acceptance.json',output);
console.log(JSON.stringify({status:output.status,parentTransactions:receipts.length,nativeChildren:withdrawals.length,writeMethods:methods.size,charterVersion:charter.version,accounting,contractBalanceGEN,browserWalletEvidence:output.browserWalletEvidence}));
}
main().catch(()=>{console.error('Fresh lifecycle verification is incomplete. Inspect saved identities and canonical state; SDK errors and raw receipt/configuration are suppressed.');process.exitCode=1;});
