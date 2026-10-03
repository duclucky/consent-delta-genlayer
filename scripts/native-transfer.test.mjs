import test from 'node:test';import assert from 'node:assert/strict';
import {nativeReceipt} from './native-transfer.mjs';
const parent=`0x${'ab'.repeat(32)}`,sender=`0x${'11'.repeat(20)}`,recipient=`0x${'22'.repeat(20)}`,amount=2n*10n**18n;
const expected={parent,sender,recipient,amount};
const raw={hash:`0x${'cd'.repeat(32)}`,triggered_by_hash:parent,from_address:sender,to_address:recipient,value:String(amount),status:'FINALIZED',triggered_on:'finalized',node_config:{secret:'DO_NOT_EXPORT'}};
test('native child binds parent, exact GEN amount and both endpoints without requiring GenVM output',()=>{
 const receipt=nativeReceipt(raw,expected);assert.equal(receipt.valueGEN,'2');assert.equal(receipt.status,'FINALIZED');assert.equal(JSON.stringify(receipt).includes('DO_NOT_EXPORT'),false);
});
test('unrelated, redirected, wrong-value or pending transfers never establish native withdrawal',()=>{
 for(const change of [{triggered_by_hash:'0x00'},{to_address:sender},{from_address:recipient},{value:'1'},{status:'ACCEPTED'},{data:{error:'failed'}}])assert.throws(()=>nativeReceipt({...raw,...change},expected));
});
test('an already rounded native amount is rejected',()=>{assert.throws(()=>nativeReceipt({...raw,value:Number(amount)},expected),/Unsafe/);});
