// Isolated in-memory feasibility spike. No deployment, signing or persisted contract source.
import { abi } from 'genlayer-js';
import { rpc, authorizedActors, saveEvidence } from './network.mjs';
const [actor]=await authorizedActors();const results=[];
for(const [name,expression]of [['datetime-float','stamp.timestamp()'],['integer-delta','(stamp - datetime.datetime(1970,1,1,tzinfo=datetime.timezone.utc)).days * 86400 + (stamp - datetime.datetime(1970,1,1,tzinfo=datetime.timezone.utc)).seconds'],['message-clock','(stamp - datetime.datetime(1970,1,1,tzinfo=datetime.timezone.utc)).days * 86400 + (stamp - datetime.datetime(1970,1,1,tzinfo=datetime.timezone.utc)).seconds']]) {
 const clock=name==='message-clock'?`datetime.datetime.fromisoformat(gl.message.raw["datetime"])`:'gl.vm.get_timestamp()';
 const code=`# v0.3.0\n# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }\nimport datetime\nimport genlayer as gl\nclass ClockProbe(gl.contract.Contract):\n    def __init__(self):\n        stamp=${clock}\n        value=${expression}\n        if value < 1700000000: raise gl.vm.UserError("CLOCK_INVALID")\n`;
 const data=abi.transactions.serialize([code,abi.calldata.encode(abi.calldata.makeCalldataObject(undefined,[])),false]);
 try{const receipt=await rpc('sim_call',[{type:'deploy',from:actor.account.address,to:`0x${'00'.repeat(20)}`,data}]);results.push({name,execution:receipt.execution_result});}catch{results.push({name,execution:'RPC_ERROR'});}
}
const output={command:'node scripts/clock-probe.mjs',signed:false,results};await saveEvidence('clock-probe.json',output);console.log(JSON.stringify(output));
