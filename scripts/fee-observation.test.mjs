import test from 'node:test';
import assert from 'node:assert/strict';
import {feeObservation,transferHashes} from './fee-observation.mjs';
const distribution={leaderTimeunitsAllocation:100,validatorTimeunitsAllocation:200,rotations:[1,2]};
test('legacy fee usage is projected without private receipt fields',()=>{
 const value=feeObservation({fees:{distribution,consumed:{executionConsumed:'101',messageFeesConsumed:'9'}},node_config:{private_key:'DO_NOT_EXPORT'}});
 assert.deepEqual(value,{leaderTimeunitsAllocation:'100',validatorTimeunitsAllocation:'200',rotationsPerRound:'2',executionBudgetPerRound:'101',totalMessageFees:'9'});
});
test('raw v0.123 fee accounting matches official consumed plus estimated and max-message rules',()=>{
 const value=feeObservation({data:{fee_accounting:{recommended_fee_preset:{distribution},execution_fee_consumed:'101',execution_fee_report:{totalEstimatedFee:'7'},message_fee_consumed:'9',genvm_message_fee_consumed:'10'}}});
 assert.equal(value.executionBudgetPerRound,'108');assert.equal(value.totalMessageFees,'10');
});
test('unmeasured or malformed profiles cannot masquerade as zero-cost measurements',()=>{
 assert.equal(feeObservation({}),null);
 assert.equal(feeObservation({fees:{distribution,consumed:{executionConsumed:'-1',messageFeesConsumed:'0'}}}),null);
});
test('only verifiable child hashes leave the raw transaction',()=>{
 const hash=`0x${'ab'.repeat(32)}`;
 assert.deepEqual(transferHashes({triggered_transactions:[{hash,node_config:{private_key:'DO_NOT_EXPORT'}},hash,'malformed']}),[hash]);
});
