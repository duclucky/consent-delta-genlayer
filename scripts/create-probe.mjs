// Isolated full-source constructor/write feasibility; read-only and not deployed.
import { readFile } from 'node:fs/promises';
import { abi } from 'genlayer-js';
import { network, authorizedActors, saveEvidence } from './network.mjs';
async function main(){
const actors=await authorizedActors();
const deadline=Math.floor(Date.now()/1000)+21600;
let code=(await readFile('contracts/consent_delta.py','utf8')).replace(/\r\n/g,'\n');
code=code.replace('def __init__(self) -> None:\n        pass',`def __init__(self) -> None:\n        self.create_charter("CD-probe", "Probe charter", Address(bytes.fromhex("${actors[1].account.address.slice(2)}")), Address(bytes.fromhex("${actors[2].account.address.slice(2)}")), "A may read the dataset.", "B may share the dataset.", "C must attribute the dataset.", ${deadline})`);
code=code.replace('require(timestamp + 30 <= activation_deadline <= timestamp + 604800, "INVALID_DEADLINE")','raise gl.vm.UserError(str(timestamp) + " " + str(activation_deadline))');
const data=abi.transactions.serialize([code,abi.calldata.encode(abi.calldata.makeCalldataObject(undefined,[])),false]);
const response=await fetch(network.icRpc,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'sim_call',params:[{type:'deploy',from:actors[0].account.address,to:`0x${'00'.repeat(20)}`,data}]})});
const body=await response.json();const result=body.error?.data?.receipt?.result;
if(typeof result!=='string')throw new Error('Expected clock probe error.');
const reason=Buffer.from(result,'base64').subarray(1).toString('utf8');
if(!/^\d+ \d+$/.test(reason)) {
 const stderr=body.error?.data?.receipt?.genvm_result?.stderr??'';
 const tail=stderr.trim().split('\n').at(-1);
 console.log(JSON.stringify({resultTag:Buffer.from(result,'base64')[0],clockNumbers:false,...(typeof tail==='string'&&tail.length<180&&/^[A-Za-z0-9_ .:'"()<>-]+$/.test(tail)&&!/[a-fA-F0-9]{32}|key|secret|token|config/i.test(tail)?{safeTerminalReason:tail}:{})}));
 throw new Error('Expected only numeric clock measurements.');
}
const [clock,bound]=reason.split(' ').map(Number);
const output={command:'node scripts/create-probe.mjs',signed:false,clockISO:new Date(clock*1000).toISOString(),deadlineISO:new Date(bound*1000).toISOString(),valid:clock+30<=bound&&bound<=clock+604800};
await saveEvidence('create-clock-probe.json',output);console.log(JSON.stringify(output));
}
main().catch(()=>{console.error('Read-only full-source clock probe unavailable; raw SDK/RPC errors are suppressed.');process.exitCode=1;});
