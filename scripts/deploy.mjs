import { createClient } from 'genlayer-js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { keccak256 } from 'viem';
import { network, chain, rpc, verifyNetwork, projectRoot, gen, saveEvidence } from './network.mjs';
import { deployQuote } from './deploy-quote.mjs';
import { safeReceipt } from './receipt.mjs';
const identityPath = path.join(projectRoot, 'docs/evidence/studio-dev/deployment.json');
async function existing() { try { return JSON.parse(await readFile(identityPath,'utf8')); } catch(error) { if(error.code==='ENOENT')return null; throw new Error('Deployment identity cannot be read.'); } }
async function persist(identity) { await saveEvidence('deployment.json',identity); }
export async function inspectDeployment(identity) {
  const raw = await rpc('eth_getTransactionByHash',[identity.transactionHash]);
  const receipt = safeReceipt(raw);
  const candidates = [raw?.data?.contract_address,raw?.data?.contractAddress,raw?.txDataDecoded?.contractAddress,raw?.tx_data_decoded?.contract_address];
  const address = candidates.find(value=>typeof value==='string'&&/^0x[0-9a-fA-F]{40}$/.test(value));
  const status = { ...receipt, ...(address?{address}:{}), ...(raw?.created_at?{createdAt:raw.created_at}:{}), ...(raw?.last_vote_timestamp?{lastVoteAt:raw.last_vote_timestamp}:{}) };
  return status;
}
async function finish(identity) {
  let previous;
  for(let attempt=0;attempt<120;attempt++) {
    let status;try { status=await inspectDeployment(identity); }catch { status={status:'UNAVAILABLE'}; }
    if(status.status!==previous){console.log(JSON.stringify({transactionHash:identity.transactionHash,...status}));previous=status.status;}
    if(status.failed){identity.status='ABANDONED_BROKEN';identity.reason='Finalized deployment execution failed; no value will be sent.';await persist(identity);throw new Error('Deployment failed. Replacement needs an explicitly archived identity.');}
    if(status.successful) {
      if(!status.address)throw new Error('Finalized SUCCESS lacks a verifiable contract address. Inspect without redeploying.');
      identity.address=status.address;identity.status='ACTIVE';identity.finalizedAt=new Date().toISOString();identity.receipt=status;
      identity.explorer=`${network.explorer}/address/${status.address}`;
      const schema=await rpc('gen_getContractSchema',[status.address]);
      identity.methods=Object.keys(schema?.methods??{});
      if(identity.methods.length!==17)throw new Error('Deployed schema does not expose the expected 17 methods.');
      await persist(identity);console.log(JSON.stringify({status:'ACTIVE',address:identity.address,execution:status.execution,methods:identity.methods.length,explorer:identity.explorer}));return;
    }
    await new Promise(resolve=>setTimeout(resolve,3000));
  }
  throw new Error('Deployment is pending. Resume this identity; do not redeploy.');
}
async function main() {
  await verifyNetwork();
  const identity=await existing();
  if(identity) {
    if(identity.network!==network.name||identity.chainId!==network.chainId)throw new Error('Existing deployment network mismatch.');
    if(process.argv.includes('--inspect')){console.log(JSON.stringify({identity:{network:identity.network,sourceCommit:identity.sourceCommit,address:identity.address,status:identity.status,transactionHash:identity.transactionHash},receipt:await inspectDeployment(identity)}));return;}
    if(identity.status==='ACTIVE'){console.log(JSON.stringify({recovered:true,address:identity.address,receipt:await inspectDeployment(identity)}));return;}
    await finish(identity);return;
  }
  if(!process.argv.includes('--deploy')){console.log(JSON.stringify({deployed:false,next:'Run inspect.mjs and deploy-quote.mjs before authorized --deploy.'}));return;}
  const clean=execFileSync('git',['status','--porcelain'],{cwd:projectRoot,encoding:'utf8'}).trim();
  if(clean)throw new Error('Commit the reviewed source and tooling before deployment.');
  const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:projectRoot,encoding:'utf8'}).trim();
  const {code,actor,preset,output}=await deployQuote();
  if(!preset?.distribution||preset.feeValue===undefined)throw new Error('Authoritative deployment fee preset is unavailable.');
  if(BigInt(preset.feeValue)>10n**16n)throw new Error('Deployment protocol deposit exceeds the 0.01 GEN bounded smoke budget.');
  const deployIdentity={network:network.name,chainId:network.chainId,rpc:network.icRpc,sourceCommit,api:'v0.3.0',depends:'py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng',actor:actor.account.address,sourceDigest:keccak256(new TextEncoder().encode(code)),status:'SIGNING',protocolDepositGEN:output.protocolDepositGEN};
  const original=actor.account.signTransaction;
  const account={...actor.account,signTransaction:async(...args)=>{
    const signed=await original(...args);const hash=keccak256(signed);
    await mkdir(path.join(projectRoot,'.local'),{recursive:true});
    await writeFile(path.join(projectRoot,'.local/deploy-signed.txt'),signed);
    deployIdentity.transactionHash=hash;deployIdentity.status='SUBMITTED_OR_SIGNED';await persist(deployIdentity);
    console.log(JSON.stringify({transactionHash:hash,status:deployIdentity.status,protocolDepositGEN:gen(preset.feeValue)}));return signed;
  }};
  const client=createClient({chain,account});
  try { const hash=await client.deployContract({code,args:[],fees:{distribution:preset.distribution,feeValue:BigInt(preset.feeValue),...(preset.messageAllocations?{messageAllocations:preset.messageAllocations}:{})}});
    if(deployIdentity.transactionHash&&hash!==deployIdentity.transactionHash)throw new Error('SDK deployment hash mismatch.');
    deployIdentity.transactionHash=hash;deployIdentity.status='SUBMITTED';await persist(deployIdentity);
  }catch {if(!deployIdentity.transactionHash)throw new Error('Deployment stopped before signing.');console.log(JSON.stringify({status:'Inspect submitted deployment before retry',transactionHash:deployIdentity.transactionHash}));}
  await finish(deployIdentity);
}
main().catch(()=>{console.error('Deployment is not verified. Inspect the saved identity before any retry; raw receipt/configuration and secrets are not logged.');process.exitCode=1;});
