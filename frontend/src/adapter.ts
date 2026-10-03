export type Address = `0x${string}`;
export type Phase = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'REVIEWABLE' | 'RETRYABLE' | 'CONSENT_REQUIRED' | 'ADOPTED' | 'REJECTED';
export type Impact = 'PRESERVED' | 'MATERIAL_CHANGE' | 'AMBIGUOUS';
export type Member = { id: string; address: Address; terms: string; ratified: boolean };
export type Charter = { id: string; title: string; phase: Phase; version: number; digest: string; deadline: number; members: Member[]; active_proposal: string; proposal_ids: string[] };
export type Proposal = { id: string; charter_id: string; phase: Phase; proposer: Address; base_version: number; old_terms: string[]; new_terms: string[]; digest: string; deadline: number; coverage: { member_id: string; impact: Impact }[]; required: string[]; approved: string[]; attempt_count: number; locked_gen: number };
export type Credit = { charter_id: string; title: string; amount_gen: number };
export type Progress = { stage: 'Signing' | 'Submitted' | 'Accepted' | 'Finalized' | 'Failed'; hash?: string; message?: string };
export type Write = 'create_charter' | 'ratify' | 'propose_amendment' | 'review' | 'consent' | 'reject' | 'expire' | 'expire_charter' | 'withdraw';
export interface ContractAdapter {
  configured: boolean;
  list(account: Address): Promise<Charter[]>;
  charter(id: string): Promise<Charter>;
  proposal(charterId: string, proposalId: string): Promise<Proposal>;
  actions(charterId: string, proposalId: string, account: Address): Promise<string[]>;
  credits(account: Address): Promise<Credit[]>;
  write(method: Write, args: unknown[], valueGen: number, progress: (p: Progress) => void): Promise<void>;
}

export const labels: Record<Phase, string> = {
  DRAFT: 'Awaiting member approval', ACTIVE: 'Current charter', EXPIRED: 'Expired',
  REVIEWABLE: 'Ready for impact review', RETRYABLE: 'Review needs another attempt',
  CONSENT_REQUIRED: 'Waiting for affected members', ADOPTED: 'Amendment adopted', REJECTED: 'Amendment declined',
};
export const impactLabels: Record<Impact, string> = { PRESERVED: 'Rights unchanged', MATERIAL_CHANGE: 'Consent required', AMBIGUOUS: 'Impact unclear' };
export const validAddress = (v: string): v is Address => /^0x[0-9a-fA-F]{40}$/.test(v) && !/^0x0{40}$/i.test(v);
export const unavailable = 'The contract is not connected yet. No on-chain records or transactions are available. You can read the guide and prepare your terms.';
const missing = async (): Promise<never> => { throw new Error(unavailable); };
// Phase 3A boundary. Phase 7 supplies the real SDK without replacing the UI.
export const unavailableAdapter: ContractAdapter = { configured: false, list: missing, charter: missing, proposal: missing, actions: missing, credits: missing, write: missing };
