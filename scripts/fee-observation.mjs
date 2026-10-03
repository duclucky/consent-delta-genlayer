// Mirrors the installed official FeeProfileCollector, projecting only numbers.
const integer=value=>{if(!/^(0|[1-9]\d*)$/.test(String(value)))throw new Error('Malformed public fee quantity.');return BigInt(value);};
function distribution(value){
 if(!value)return null;
 return {leaderTimeunitsAllocation:integer(value.leaderTimeunitsAllocation),validatorTimeunitsAllocation:integer(value.validatorTimeunitsAllocation),
 rotationsPerRound:(value.rotations??[0]).map(integer).reduce((a,b)=>a>b?a:b,0n)};
}
export function feeObservation(raw){
 try{
  let observation;
  if(raw?.fees?.consumed){const fees=raw.fees;observation={...distribution(fees.distribution),executionBudgetPerRound:integer(fees.consumed.executionConsumed),totalMessageFees:integer(fees.consumed.messageFeesConsumed)};}
  else{
   const leaders=raw?.consensus_data?.leader_receipt;
   const receipts=Array.isArray(leaders)?leaders:[leaders];
   const candidates=[raw?.fee_accounting,raw?.feeAccounting,raw?.data?.fee_accounting,raw?.data?.feeAccounting,raw?.genvm_result?.fee_accounting,...receipts.flatMap(item=>[item?.fee_accounting,item?.feeAccounting,item?.genvm_result?.fee_accounting])];
   const accounting=candidates.find(item=>item&&typeof item==='object');if(!accounting)return null;
   const d=distribution(accounting.fees_distribution??accounting.feesDistribution??accounting.recommended_fee_preset?.distribution??accounting.recommendedFeePreset?.distribution);
   observation={...d,executionBudgetPerRound:integer(accounting.execution_fee_consumed??0)+integer(accounting.execution_fee_report?.totalEstimatedFee??0),totalMessageFees:[accounting.message_fee_consumed??0,accounting.genvm_message_fee_consumed??0].map(integer).reduce((a,b)=>a>b?a:b)};
  }
  if(Object.keys(observation).length!==5)return null;
  return Object.fromEntries(Object.entries(observation).map(([key,value])=>[key,String(value)]));
 }catch{return null;}
}
export function transferHashes(raw){
 const hashes=new Set();
 for(const item of [...(raw?.triggered_transactions??[]),...(raw?.triggeredTransactions??[])]){
  const value=typeof item==='string'?item:item?.hash??item?.transaction_hash??item?.txId;
  if(typeof value==='string'&&/^0x[0-9a-fA-F]{64}$/.test(value))hashes.add(value);
 }
 return [...hashes];
}
