import test from 'node:test';
import assert from 'node:assert/strict';
import { writeSimulation } from './write-quote.mjs';
const config={address:`0x${'11'.repeat(20)}`,from:`0x${'22'.repeat(20)}`,method:'expire',args:['CD-1','AM-1'],value:0n};
test('Studio temporal preview has UTC time and finalized state without signing metadata',()=>{
 const value=writeSimulation(config,'2026-10-03T05:00:00.000Z');
 assert.deepEqual(value.sim_config,{genvm_datetime:'2026-10-03T05:00:00.000Z'});
 assert.equal(value.transaction_hash_variant,'latest-final');
 assert.equal(value.type,'write');assert.equal(value.from,config.from);
 assert.equal(value.value,undefined);assert.equal(value.transaction_context,undefined);
});
test('the bounded 2 GEN purse is present in value-bearing simulations',()=>{
 const value=writeSimulation({...config,method:'propose_amendment',value:2n*10n**18n},'2026-10-03T05:00:00.000Z');
 assert.equal(BigInt(value.value),2n*10n**18n);
});
test('ambiguous preview datetime is rejected before RPC',()=>{
 assert.throws(()=>writeSimulation(config,'2026-10-03 05:00:00'),/UTC/);
});
