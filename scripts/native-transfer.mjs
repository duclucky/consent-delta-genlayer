import {network,gen} from './network.mjs';
const address=value=>typeof value==='string'&&/^0x[0-9a-fA-F]{40}$/.test(value);
export function nativeReceipt(raw,{parent,sender,recipient,amount}){
 if(!raw||!/^0x[0-9a-fA-F]{64}$/.test(raw.hash??'')||raw.triggered_by_hash?.toLowerCase()!==parent.toLowerCase())throw new Error('Native child is not bound to its parent.');
 if(!address(raw.from_address)||!address(raw.to_address)||raw.from_address.toLowerCase()!==sender.toLowerCase()||raw.to_address.toLowerCase()!==recipient.toLowerCase())throw new Error('Native child destination or sender mismatch.');
 if(typeof raw.value==='number'&&!Number.isSafeInteger(raw.value))throw new Error('Unsafe numeric native value.');
 if(BigInt(raw.value)!==amount)throw new Error('Native child value mismatch.');
 const leaders=raw.consensus_data?.leader_receipt;
 if(raw.status!=='FINALIZED'||raw.error||raw.data?.error||(Array.isArray(leaders)&&leaders.some(item=>item.execution_result&&item.execution_result!=='SUCCESS')))throw new Error('Native child is not finalized without errors.');
 return {hash:raw.hash,parentHash:parent,status:'FINALIZED',sender:raw.from_address,recipient:raw.to_address,valueGEN:gen(raw.value),createdAt:raw.created_at,triggeredOn:raw.triggered_on,explorer:`${network.explorer}/tx/${raw.hash}`};
}
export async function explorerRelations(hash){
 if(!/^0x[0-9a-fA-F]{64}$/.test(hash))throw new Error('Invalid transaction hash.');
 const response=await fetch(new URL(`/api/explorer/transactions/${hash}`,network.icRpc),{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error('Explorer relations unavailable.');
 // Preserve exact large integer source tokens from the authoritative REST DTO.
 return JSON.parse(await response.text(),(key,value,context)=>typeof value==='number'&&!Number.isSafeInteger(value)?context.source:value);
}
