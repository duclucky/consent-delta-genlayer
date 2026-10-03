// Read-only fault classification. Never export arbitrary stdout/configuration.
import { abi } from 'genlayer-js';
import { CalldataAddress } from 'genlayer-js/types';
import { hexToBytes } from 'viem';
import { readFile } from 'node:fs/promises';
import { network, authorizedActors, saveEvidence } from './network.mjs';
const deployment=JSON.parse(await readFile('docs/evidence/studio-dev/deployment.json','utf8'));
const actors=await authorizedActors();
const args=['CD-live-035','Shared research charter',...actors.slice(1).map(actor=>new CalldataAddress(hexToBytes(actor.account.address))),'A may read the shared research dataset.','B may redistribute the shared research dataset without paying a fee.','C must publish attribution when using the shared research dataset.',BigInt(Math.floor(Date.now()/1000)+21600)];
const data=abi.transactions.serialize([abi.calldata.encode(abi.calldata.makeCalldataObject('create_charter',args)),false]);
const response=await fetch(network.icRpc,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'sim_call',params:[{type:'write',from:actors[0].account.address,to:deployment.address,data,transaction_hash_variant:'latest-final'}]})});
const envelope=await response.json();const receipt=envelope.result??envelope.error?.data?.receipt??envelope.error;
const code=await readFile('contracts/consent_delta.py','utf8');
const reasons=[...code.matchAll(/"([A-Z][A-Z_]{3,})"/g)].map(match=>match[1]);
const classes=['AttributeError','TypeError','NameError','ValueError','KeyError','UserError','MemoryError','AssertionError','StorageError','UnicodeDecodeError','HostError','GenVMError','RuntimeError','NotImplementedError','Panic','VMError'];
const identifiers=['get_timestamp','timestamp','sender_address','as_hex','digest','TreeMap','Keccak256','Charter','wallet_counts','CalldataAddress','isascii','fees','fee','budget','insufficient','read','write','storage','datetime','unsupported','not supported','not implemented','unknown method','GetTimestamp','GetDateTime','failed','host','ModuleNotFoundError','AttributeError','not found'];
const foundReasons=new Set(),foundClasses=new Set(),foundIdentifiers=new Set();
function inspect(value){
 if(typeof value==='string'){
   for(const reason of reasons)if(value.includes(reason))foundReasons.add(reason);
   for(const error of classes)if(value.includes(error))foundClasses.add(error);
   for(const name of identifiers)if(value.includes(name))foundIdentifiers.add(name);
   // VM result strings use a tagged base64 envelope. Decode in memory only.
   if(value.length<100000&&/^[A-Za-z0-9+/=]+$/.test(value)){const decoded=Buffer.from(value,'base64').toString('utf8');if(decoded!==value&&classes.some(error=>decoded.includes(error)))inspect(decoded);}
   if(value.length<100000&&/^(0x)?[a-f0-9]+$/i.test(value)){const decoded=Buffer.from(value.replace(/^0x/,''),'hex').toString('utf8');if(decoded!==value&&classes.some(error=>decoded.includes(error)))inspect(decoded);}
 }else if(value&&typeof value==='object')for(const[key,item]of Object.entries(value))if(!['node_config','contract_state','contract_code','contract_state_hash'].includes(key))inspect(item);
}
inspect(receipt);
const output={command:'node scripts/diagnose-create.mjs',signed:false,rpcErrorCode:envelope.error?.code??null,errorFields:Object.keys(envelope.error??{}),detailFields:Object.keys(envelope.error?.data??{}),receiptFields:Object.keys(receipt??{}),resultFields:typeof receipt.result==='object'?Object.keys(receipt.result??{}):[],execution:receipt.execution_result??null,mode:receipt.mode??null,reasons:[...foundReasons],errorClasses:[...foundClasses],identifiers:[...foundIdentifiers]};
output.genvmFields=Object.keys(receipt.genvm_result??{});
output.logFieldTypes=Object.fromEntries(Object.entries(receipt.genvm_result??{}).filter(([key])=>/stdout|stderr/.test(key)).map(([key,value])=>[key,{type:typeof value,length:typeof value==='string'?value.length:null}]));
const safePatterns=[/has no attribute ['"]get_timestamp['"]/g,/Floating point[^\n]{0,60}/g,/unknown[^\n]{0,35}GetTimestamp/gi,/not implemented[^\n]{0,35}/gi,/GetTimestamp[^\n]{0,35}/g];
const diagnostics=JSON.stringify(receipt.genvm_result??{});output.safePatterns=safePatterns.flatMap(pattern=>diagnostics.match(pattern)??[]).filter(value=>!/[a-fA-F0-9]{32}|key|secret|token|config/i.test(value));
output.exceptionNames=[...new Set(diagnostics.match(/\b[A-Za-z_][A-Za-z0-9_.]{0,60}(?:Error|Exception)\b/g)??[])];
output.clockFailureKind=['has no attribute','not supported','not implemented','unknown','undefined','float','floating','invalid','builtin','error','panic'].filter(term=>diagnostics.toLowerCase().includes(term));
const terminalLine=receipt.genvm_result?.stderr?.trim().split('\n').at(-1);
if(typeof terminalLine==='string'&&terminalLine.length<=180&&/^[A-Za-z0-9_ .:'"()<>-]+$/.test(terminalLine)&&!/[a-fA-F0-9]{32}|key|secret|token|config/i.test(terminalLine))output.safeTerminalReason=terminalLine;
if(typeof receipt.result==='string'&&receipt.result.length<=180&&/^[a-zA-Z0-9_ .:'"()<>-]+$/.test(receipt.result)&&!/[a-fA-F0-9]{32}|key|secret|token|config/i.test(receipt.result)) output.safeErrorReason=receipt.result;
await saveEvidence('create-diagnosis.json',output);console.log(JSON.stringify(output));
