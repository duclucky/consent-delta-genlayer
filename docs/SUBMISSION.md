# Copy-ready submission packet

**Recommended category:** Projects

**Title:** ConsentDelta: affected-member consent for shared charter amendments

**Description (994 characters, excluding the trailing newline):**

ConsentDelta protects affected-member consent when a shared charter changes. Three wallets ratify exact terms; an authorized member proposes replacement text with a 2 GEN purse. GenLayer validators independently compare each member's permissions, restrictions and duties over locked old/new bytes. Semantic agreement covers all three member IDs and impact classes; code verifies bindings, coverage and changed roots before deriving required consent. Exact affected-member assent adopts the next canonical version. Refusal or expiry retains the prior version and releases only the funder's fixed refund; withdrawals use the EVM recipient boundary. One reusable contract exposes 9 writes and 8 views. 127 direct, 24 tooling and 37 frontend tests pass. Studio Dev proves adoption/refusal/expiry, three 2 GEN transfers and zero liability. Production browser reads pass; extension-wallet signing is pending. Constitutive records only: no legal identity, external adoption or cross-chain enforcement.

**Evidence:**

- Repository: https://github.com/duclucky/consent-delta-genlayer
- Primary contract: https://explorer-studio-dev.genlayer.com/address/0x18F1689CE9241894433F44b41989C46E45a13DC5
- Consumer contract: N/A; the single primitive owns its actual boundary.
- Lifecycle: https://github.com/duclucky/consent-delta-genlayer/blob/main/docs/evidence/studio-dev/LIFECYCLE.md
- Fresh safe receipt/authority/native transfer projection: https://github.com/duclucky/consent-delta-genlayer/blob/main/docs/evidence/studio-dev/lifecycle-acceptance.json
- CI: https://github.com/duclucky/consent-delta-genlayer/actions/workflows/check.yml — the final audit must bind a successful run to the final public HEAD; older passing runs are insufficient.
- Demo: https://consent-delta-genlayer.vercel.app/charters/CD-live-035 — actual browser **read** proof. Extension-wallet **write** proof is PENDING_REAL_EVIDENCE.

**Verified facts:** one `ConsentDeltaContract`; 9 writes/8 views; 127 direct, 24 tooling and 37 frontend tests (188 total); Studio Dev; 17 finalized lifecycle parent transactions, two normal semantic reviews with five initial validators each, three finalized native 2 GEN children; adoption version 2, refusal, stale-phase expiry and draft closure; funded/withdrawn 6 GEN and final native balance 0 GEN. Deployment is separately finalized SUCCESS.

**Honest limitations / pending:** actual extension-wallet signing and a browser-completed consequential lifecycle; unauthenticated Portal, authenticated field/character/video requirements and final submission. Three wallet members, bounded constitutive text, one live amendment and fixed purse. No legal identity/enforceability, external performance, adoption or cross-chain enforcement. Fee profiles are representative bounded measurements, with a documented non-failing bundle warning.

**Why Projects:** the contribution includes a reusable intelligent primitive and a complete user-facing React product that reads deployed state and implements selected-wallet transaction paths. The frontend is part of the contribution, so the Intelligent Contracts category would not reflect the repository's scope. Missing extension-wallet evidence is disclosed rather than bypassed by switching categories. This is a new project, not a milestone on an already-accepted version.

**Portal status:** NOT SUBMITTED. The public Builders page requires wallet connection to unlock tasks. This packet uses the master prompt's conservative 1000-character default, not a claimed authenticated field limit. Verify account-only requirements after login and obtain explicit action-time authorization before the final Submit action.

**Owner acceptance:** NOT COMPLETE until the genuine extension-wallet lifecycle proof is added and the remaining checklist items are verified. A clean offline checker is necessary but does not replace that evidence.

---

**Project name:** ConsentDelta

**Description:** ConsentDelta uses GenLayer semantic consensus to identify affected members and require their consent before adopting shared charter amendments.

**GitHub (public):** https://github.com/duclucky/consent-delta-genlayer

**Live app:** https://consent-delta-genlayer.vercel.app

**Contract (Studio Dev):** 0x18F1689CE9241894433F44b41989C46E45a13DC5
