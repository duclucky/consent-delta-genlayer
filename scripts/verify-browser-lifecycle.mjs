// Read-only receipt, origin, canonical-state and native-delivery verification.
import {readFile} from 'node:fs/promises';
import {createClient} from 'genlayer-js';
import {TransactionHashVariant} from 'genlayer-js/types';
import {keccak256} from 'viem';
import {chain,network,rpc,gen,verifyNetwork,saveEvidence} from './network.mjs';
import {safeReceipt} from './receipt.mjs';
import {explorerRelations,nativeReceipt} from './native-transfer.mjs';
const check=ok=>{if(!ok)throw new Error('Browser lifecycle evidence mismatch.');};
const units=text=>{const [whole,fraction='']=text.split('.');return BigInt(whole)*10n**18n+BigInt(fraction.padEnd(18,'0'));};
async function main(){
 await verifyNetwork();
 const deployment=JSON.parse(await readFile('docs/evidence/studio-dev/deployment.json','utf8'));
 const browser=JSON.parse(await readFile('docs/evidence/studio-dev/browser-lifecycle.json','utf8'));
 const peers=JSON.parse(await readFile('docs/evidence/studio-dev/browser-peers.json','utf8'));
 check(browser.address===deployment.address&&peers.address===deployment.address&&browser.sourceCommit===deployment.sourceCommit);
 check(keccak256(await readFile('contracts/consent_delta.py'))===deployment.sourceDigest);
 const wallet=browser.browserActor;
 const client=createClient({chain});
 const view=async(name,args)=>JSON.parse(await client.readContract({address:deployment.address,functionName:name,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL}));
 const completed=browser.steps.filter(step=>step.completed);
 check(completed.length===5&&new Set(completed.map(step=>step.method)).size===5);
 const receipts=[];
 for(const step of completed){
  const raw=await rpc('eth_getTransactionByHash',[step.hash]);const receipt=safeReceipt(raw);
  check(receipt.successful&&!raw.leader_only&&raw.hash===step.hash&&raw.from_address.toLowerCase()===wallet.toLowerCase()&&raw.to_address.toLowerCase()===deployment.address.toLowerCase());
  check(step.source==='BROWSER_WALLET_SIGNED'&&step.canonicalReloadObserved&&step.after.accounting.conserved);
  receipts.push({method:step.method,source:step.source,actor:raw.from_address,contract:raw.to_address,originVerified:true,receipt});
 }
 const failed=browser.steps.filter(step=>!step.completed);
 check(failed.length===1&&safeReceipt(await rpc('eth_getTransactionByHash',[failed[0].hash])).failed);
 check((await explorerRelations(failed[0].hash)).triggeredTransactions.length===0);
 const peerSteps=peers.steps.filter(step=>step.source==='SCRIPT_SIGNED_API');check(peerSteps.length===3);
 for(const step of peerSteps){
  const raw=await rpc('eth_getTransactionByHash',[step.hash]);const receipt=safeReceipt(raw);
  check(step.completed&&receipt.successful&&!raw.leader_only&&raw.from_address.toLowerCase()===step.actor.toLowerCase()&&raw.to_address.toLowerCase()===deployment.address.toLowerCase());
  receipts.push({method:step.method,source:step.source,actor:raw.from_address,contract:raw.to_address,originVerified:true,receipt});
 }
 const withdraw=completed.find(step=>step.method==='withdraw');
 const relations=await explorerRelations(withdraw.hash);check(relations.triggeredTransactions.length===1);
 const child=nativeReceipt(relations.triggeredTransactions[0],{parent:withdraw.hash,sender:deployment.address,recipient:wallet,amount:2n*10n**18n});
 check(child.hash===withdraw.nativeTransferProof.childReceipt.hash&&units(withdraw.before.contractBalanceGEN)-units(withdraw.after.contractBalanceGEN)===2n*10n**18n);
 check(units(withdraw.after.walletBalanceGEN)>units(withdraw.before.walletBalanceGEN));
 const cid=withdraw.charterId,pid=withdraw.proposalId;
 const charter=await view('get_charter',[cid]),proposal=await view('get_proposal',[cid,pid]),accounting=await view('get_accounting',[cid]);
 const attempt=await view('get_attempt',[cid,pid,BigInt(proposal.attempt_count)]);
 check(charter.phase==='ACTIVE'&&charter.version===2&&proposal.phase==='ADOPTED'&&proposal.required.join()==='B'&&proposal.approved.includes('B'));
 check(attempt.digest===proposal.digest&&attempt.base_version===proposal.base_version&&attempt.coverage.length===3&&attempt.coverage.map(row=>row.member_id).sort().join()==='A,B,C'&&attempt.coverage.every(row=>row.impact===(row.member_id==='B'?'MATERIAL_CHANGE':'PRESERVED')));
 check(accounting.conserved&&accounting.funded_gen===2&&accounting.withdrawn_gen===2&&accounting.credits_gen===0&&accounting.locked_gen===0);
 const balanceGEN=gen(await rpc('eth_getBalance',[deployment.address,'latest']));check(balanceGEN==='0');
 const funding=peers.steps.find(step=>step.label==='browser-funding-2-gen');check(funding?.completed);
 const fundingDTO=(await explorerRelations(funding.hash)).transaction;
 check(fundingDTO.status==='FINALIZED'&&BigInt(fundingDTO.value)===2n*10n**18n&&fundingDTO.from_address.toLowerCase()===funding.actor.toLowerCase()&&fundingDTO.to_address.toLowerCase()===wallet.toLowerCase());
 check(browser.logoutObserved&&browser.networkProof.walletChain==='0xf22d'&&browser.networkProof.icHttpStatus===200&&!browser.networkProof.corsError);
 const out={command:'node scripts/verify-browser-lifecycle.mjs',verifiedAt:new Date().toISOString(),network:network.name,address:deployment.address,sourceCommit:deployment.sourceCommit,status:'PASS_OWNER_AUTHORIZED_HYBRID_PRIMARY_JOURNEY',browser:browser.browser,browserActor:wallet,browserSignedWrites:completed.length,peerApiSignedWrites:peerSteps.length,failedParentsExcluded:failed.map(step=>step.hash),receipts,child,contractDecreaseGEN:'2',recipientBeforeGEN:withdraw.before.walletBalanceGEN,recipientAfterGEN:withdraw.after.walletBalanceGEN,charter:{id:cid,version:charter.version},proposal:{id:pid,phase:proposal.phase,required:proposal.required},attempt:{index:proposal.attempt_count,coverage:attempt.coverage},accounting,contractBalanceGEN:balanceGEN,funding:{hash:funding.hash,valueGEN:'2',sender:funding.actor,recipient:wallet},limitations:browser.limitations};
 await saveEvidence('browser-acceptance.json',out);
 console.log(JSON.stringify({status:out.status,browserSignedWrites:out.browserSignedWrites,peerApiSignedWrites:out.peerApiSignedWrites,nativeChild:child.hash,valueGEN:child.valueGEN,accounting,contractBalanceGEN:balanceGEN}));
}
main().catch(()=>{console.error('Browser lifecycle verification is incomplete. Read the saved hashes before any retry; raw errors/configuration are suppressed.');process.exitCode=1;});
