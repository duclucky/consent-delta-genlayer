import { abi } from 'genlayer-js';
import { rpc } from './network.mjs';
// Studio's write simulator needs an explicit preview datetime. This metadata
// never enters writeContract or the signed transaction; the network sets time.
export function writeSimulation({address, from, method, args, value}, datetime) {
  if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(datetime)) throw new Error('Preview datetime must be UTC.');
  return {type:'write', to:address, from,
    data:abi.transactions.serialize([abi.calldata.encode(abi.calldata.makeCalldataObject(method,args)),false]),
    transaction_hash_variant:'latest-final', sim_config:{genvm_datetime:datetime},
    ...(BigInt(value)>0n?{value:`0x${BigInt(value).toString(16)}`}:{})};
}
export async function writeQuote(options) {
  const estimate=await rpc('sim_estimateTransactionFees',[writeSimulation(options,new Date().toISOString())]);
  const preset=estimate?.recommendedPreset;
  if(!preset?.distribution||preset.feeValue===undefined)throw new Error('An authoritative write fee estimate is unavailable.');
  return {...preset,feeValue:BigInt(preset.feeValue)};
}
