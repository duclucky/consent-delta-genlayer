// Read-only in-memory clock measurement. No deployment or transaction signing.
import { abi } from 'genlayer-js';
import { network, authorizedActors, saveEvidence } from './network.mjs';
async function main(){
const [actor]=await authorizedActors();
const code='# v0.3.0\n# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }\nimport datetime\nimport genlayer as gl\nclass ClockMeasure(gl.contract.Contract):\n    def __init__(self):\n        stamp=datetime.datetime.fromisoformat(gl.message.raw["datetime"])\n        delta=stamp-datetime.datetime(1970,1,1,tzinfo=datetime.timezone.utc)\n        raise gl.vm.UserError(str(delta.days*86400+delta.seconds))\n';
const data=abi.transactions.serialize([code,abi.calldata.encode(abi.calldata.makeCalldataObject(undefined,[])),false]);
const response=await fetch(network.icRpc,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'sim_call',params:[{type:'deploy',from:actor.account.address,to:`0x${'00'.repeat(20)}`,data}]})});
const envelope=await response.json();
const result=envelope.error?.data?.receipt?.result;
if(typeof result!=='string')throw new Error('Simulation clock unavailable.');
const epoch=Buffer.from(result,'base64').subarray(1).toString('utf8');
if(!/^\d{10}$/.test(epoch))throw new Error('Expected a bounded numeric clock measurement.');
const output={command:'node scripts/simulation-clock.mjs',signed:false,simulationDatetime:new Date(Number(epoch)*1000).toISOString(),localDatetime:new Date().toISOString()};
await saveEvidence('simulation-clock.json',output);console.log(JSON.stringify(output));
}
main().catch(()=>{console.error('Read-only simulation clock unavailable; raw SDK/RPC errors are suppressed.');process.exitCode=1;});
