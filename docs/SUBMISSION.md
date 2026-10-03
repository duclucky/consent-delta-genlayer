# Copy-ready submission packet

**Recommended category:** Projects

**Title:** ConsentDelta: affected-member consent for shared charter amendments

**Description (959 characters, excluding the trailing newline):**

ConsentDelta protects affected-member consent when shared terms change. Three wallets ratify exact charter bytes; a member proposes replacement terms with 2 GEN. GenLayer validators independently compare permissions, restrictions and duties for all three locked members. Code validates bindings, coverage and changed roots before deriving whose assent is required. Exact affected-member consent adopts the next canonical version; refusal or expiry retains the old version and releases the fixed funder's refund. The model never chooses amounts or recipients. One reusable contract exposes 9 writes and 8 views. 127 direct, 24 tooling and 40 frontend tests pass. Studio Dev proves adoption/refusal/expiry and four native 2 GEN transfers, with zero liability. Chrome/OKX proves five primary writes; peer ratification/consent uses owner-authorized API signatures. Constitutive wallet records only: no legal identity, external adoption or cross-chain enforcement.

**How-to:** [Nine detailed product steps](PORTAL-HOWTO.md), entered as separate heading/instruction rows in the authenticated form.

**Evidence:**

- Repository: https://github.com/duclucky/consent-delta-genlayer
- Primary contract: https://explorer-studio-dev.genlayer.com/address/0x18F1689CE9241894433F44b41989C46E45a13DC5
- Consumer contract: N/A; the single primitive owns its actual boundary.
- Lifecycle: https://github.com/duclucky/consent-delta-genlayer/blob/main/docs/evidence/studio-dev/LIFECYCLE.md
- Chrome/OKX primary journey: https://github.com/duclucky/consent-delta-genlayer/blob/main/docs/evidence/studio-dev/browser-acceptance.json
- Fresh safe receipt/authority/native transfer projection: https://github.com/duclucky/consent-delta-genlayer/blob/main/docs/evidence/studio-dev/lifecycle-acceptance.json
- CI: https://github.com/duclucky/consent-delta-genlayer/actions/workflows/check.yml — the final audit must bind a successful run to the final public HEAD; older passing runs are insufficient.
- Demo: https://consent-delta-genlayer.vercel.app/charters/CD-live-035 — actual browser **read** proof; five Chrome/OKX **writes** and three API peer actions are separately verified in browser-acceptance.json.

**Verified facts:** one `ConsentDeltaContract`; 9 writes/8 views; 127 direct, 24 tooling and 40 frontend tests (191 total); Studio Dev; 17 finalized lifecycle parent transactions, two normal semantic reviews with five initial validators each, three finalized native 2 GEN children; adoption version 2, refusal, stale-phase expiry and draft closure; funded/withdrawn 6 GEN and final native balance 0 GEN. The separate primary journey adds five Chrome/OKX writes, three API peer writes, a fourth finalized native 2 GEN child and 2 GEN funded/withdrawn with zero remaining liability. Deployment is separately finalized SUCCESS.

**Honest limitations / pending:** all-member/alternative browser signatures are not claimed; Portal review is pending after the owner submitted the application. Main-persona Chrome/OKX signatures and owner-authorized API peer actions are verified. Three wallet members, bounded constitutive text, one live amendment and fixed purse. No legal identity/enforceability, external performance, adoption or cross-chain enforcement. Fee profiles are representative bounded measurements, with a documented non-failing bundle warning.

**Why Projects:** the contribution includes a reusable intelligent primitive and a complete user-facing React product that reads deployed state and implements selected-wallet transaction paths. The frontend is part of the contribution, so the Projects category reflects the repository's scope. The verified primary browser journey and API peer actions are labeled separately. This is a new project, not a milestone on an already-accepted version.

**Portal status:** SUBMITTED / PENDING REVIEW. Owner submission confirmed in authenticated Chrome: submission `a1e356a1-522f-4c09-bcfd-29ccf09c84ce`, project 1303, revision 1 locked as Submitted. All nine How-to steps and 7/7 required fields were verified after submission. See [safe Portal record](evidence/local/portal-submission.json). Authenticated Projects form verified: description 1000, one-liner 180, verification outcome 500 characters; logo 128-2048 px/max 2 MB; demo video optional; website required; two available weekly slots. Form preparation and final action are separate. The owner performed the final Submit action; no duplicate submission was sent.

**Owner acceptance:** final checks/current-commit CI and checklist must be verified. Browser primary-journey proof is now real under the explicitly authorized hybrid scope; API/alternative actions are not relabeled browser signatures. The offline checker alone is insufficient.

---

**Project name:** ConsentDelta

**Description:** ConsentDelta uses GenLayer semantic consensus to identify affected members and require their consent before adopting shared charter amendments.

**GitHub (public):** https://github.com/duclucky/consent-delta-genlayer

**Live app:** https://consent-delta-genlayer.vercel.app

**Contract (Studio Dev):** 0x18F1689CE9241894433F44b41989C46E45a13DC5
