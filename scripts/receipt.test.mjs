import test from 'node:test';
import assert from 'node:assert/strict';
import { safeReceipt } from './receipt.mjs';
const hash = `0x${'a'.repeat(64)}`;
test('raw Studio leader execution is required and private data is projected out', () => {
  const result = safeReceipt({ status: 'FINALIZED', hash, consensus_data: {
    leader_receipt: [{ execution_result: 'SUCCESS', node_config: { private: 'DO_NOT_EXPORT' } }],
  }, trace: 'DO_NOT_EXPORT', validator_configs: ['DO_NOT_EXPORT'] });
  assert.deepEqual(result, { hash, status: 'FINALIZED', execution: 'SUCCESS', finalized: true, successful: true, failed: false });
  assert.equal(JSON.stringify(result).includes('DO_NOT_EXPORT'), false);
  assert.deepEqual(safeReceipt(result), result);
});
test('normalized SDK execution result and RPC envelopes', () => {
  assert.equal(safeReceipt({ result: { status: 'FINALIZED', executionResult: 'FINISHED_WITH_RETURN' } }).successful, true);
  assert.equal(safeReceipt({ status: 7, statusName: 'FINALIZED', result: 0, txExecutionResultName: 'FINISHED_WITH_RETURN', txId: hash }).successful, true);
});
test('terminal failure, absent execution, canceled and undetermined never become success', () => {
  for (const receipt of [{ status: 'FINALIZED' }, { status: 'FINALIZED', execution_result: 'ERROR' },
    { status: 'UNDETERMINED' }, { status: 'CANCELED' }]) {
    assert.equal(safeReceipt(receipt).successful, false);
    assert.equal(safeReceipt(receipt).failed, true);
  }
});
test('accepted success awaits finalization and unknown states are explicit', () => {
  assert.equal(safeReceipt({ status: 'ACCEPTED', execution_result: 'SUCCESS' }).successful, false);
  assert.equal(safeReceipt({ status: 'invalid', hash: 'private arbitrary text' }).status, 'UNKNOWN');
  assert.equal('hash' in safeReceipt({ status: 'invalid', hash: 'private arbitrary text' }), false);
});
