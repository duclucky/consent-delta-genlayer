// Project an explicit public allowlist. Full Studio receipts/config never leave
// this parser; FINALIZED alone does not establish successful IC execution.
const statuses = new Set(['PENDING', 'ACTIVATED', 'CANCELED', 'PROPOSING', 'COMMITTING', 'REVEALING', 'ACCEPTED', 'UNDETERMINED', 'FINALIZED']);
const hashes = value => typeof value === 'string' && /^0x[0-9a-fA-F]{64}$/.test(value) ? value : undefined;
export function safeReceipt(input) {
  const raw = input?.result && typeof input.result === 'object' && !('status' in input) && !('statusName' in input) ? input.result : input;
  if (!raw || typeof raw !== 'object') throw new Error('Transaction status is unavailable.');
  const status = String(raw.statusName ?? raw.status ?? raw.transaction_status ?? '').toUpperCase();
  const leaders = raw.consensus_data?.leader_receipt;
  const execution = raw.txExecutionResultName ?? raw.executionResult ?? raw.execution_result ?? (typeof raw.execution === 'string' ? raw.execution : raw.execution?.result)
    ?? (Array.isArray(leaders) ? leaders.find(item => item && item.execution_result)?.execution_result : undefined);
  const result = typeof execution === 'string' ? execution.toUpperCase() : undefined;
  const hash = hashes(raw.hash ?? raw.txId ?? raw.transaction_hash);
  const successful = result === 'SUCCESS' || result === 'FINISHED_WITH_RETURN';
  return { ...(hash ? { hash } : {}), status: statuses.has(status) ? status : 'UNKNOWN',
    ...(result && /^[A-Z_]{1,40}$/.test(result) ? { execution: result } : {}),
    finalized: status === 'FINALIZED', successful: status === 'FINALIZED' && successful,
    failed: ['CANCELED', 'UNDETERMINED'].includes(status)
      || (status === 'FINALIZED' && !successful),
  };
}
