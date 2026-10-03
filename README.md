# ConsentDelta

Change a shared charter with the consent of the people whose rights change.

ConsentDelta is a GenLayer Projects application for three wallet-authenticated members. Validators compare the meaning of an exact amendment with the current co-ratified charter. Contract code derives which members must consent before the new version becomes canonical.

Status: deployed on Studio Dev, with a public frontend that reads canonical contract state. The script-signed lifecycle verified adoption, refusal, expiry and three 2 GEN withdrawals, with zero remaining contract balance. The owner-authorized primary journey also passed on Chrome/OKX: five main-persona wallet writes, with three peer actions separately signed through API.

The proposing member locks exactly **2 GEN** for an amendment. Adoption opens that member's fixed implementation credit; rejection or expiry refunds it. Semantic output never supplies recipients or payout amounts.

See [specification](docs/README.md) for the trust boundary, workflow and limitations.

## Live App

[ConsentDelta](https://consent-delta-genlayer.vercel.app) · [Verified live charter](https://consent-delta-genlayer.vercel.app/charters/CD-live-035) · [Browser read proof](docs/evidence/local/production-browser.json) · [Chrome/OKX primary journey](docs/evidence/studio-dev/browser-acceptance.json).

The production app returned HTTP 200 and loaded charter version 2 and all three amendment outcomes through its same-origin IC proxy. This proves live browser reads. Chrome/OKX additionally proves actual creation, A ratification, a 2 GEN proposal, semantic review and withdrawal. B/C ratification and affected B consent use owner-authorized API signatures; they are not presented as browser signatures. The adopted version and finalized native 2 GEN child were verified, with zero remaining liability. See [browser evidence](docs/evidence/studio-dev/BROWSER-LIFECYCLE.md).

## Problem and architecture

A proposer should not decide privately which peers lose permissions or gain duties. All three wallet members ratify exact initial charter bytes. A member proposes complete replacement terms; GenLayer validators independently classify each member's semantic impact. Contract code validates coverage and binding, derives the affected set and requires those members' exact assent before adoption. Unaffected members have no arbitrary veto.

One `ConsentDeltaContract` owns charter versions, isolated proposals, review attempts, consent and GEN accounting. Nine writes and eight views form its reusable interface. React reads finalized canonical records; the selected EVM wallet signs writes on Studio Dev, while the read-only IC proxy keeps browser reads separate. No backend supplies verdicts, recipients or payout amounts. See the specification's authority, safety, temporal, value-destination and claim matrices.

## Deployed Contract

Studio Dev: `0x18F1689CE9241894433F44b41989C46E45a13DC5`.

[Contract explorer](https://explorer-studio-dev.genlayer.com/address/0x18F1689CE9241894433F44b41989C46E45a13DC5) · [Finalized lifecycle and native transfers](docs/evidence/studio-dev/LIFECYCLE.md).

## Verification

Use Node.js 24 and Python 3.12. Create `.venv`, install `requirements.txt`, run `npm ci`, then `npm run check`. The check validates the single contract, 127 direct tests, 24 tooling tests, 40 frontend tests, TypeScript and the production build. It requires no wallet keys or network writes.

[CI workflow](https://github.com/duclucky/consent-delta-genlayer/actions/workflows/check.yml) runs the same checks on each public main commit. Local results and Studio Dev lifecycle evidence are distinct; no critical test is skipped or marked expected-failure.

## Run the frontend

Copy `frontend/.env.example` to the ignored `frontend/.env` and set `VITE_CONTRACT_ADDRESS` to the deployed address above. Run `npm run dev` and open `http://127.0.0.1:5177`. The app reads canonical Studio Dev state through a same-origin proxy. Connect an installed EVM wallet from the wallet selection modal before writing.

The eight routes cover introduction, charter search, creation, charter/history, amendment preparation, impact/consent, account/credits and help. Role/state views control actions. The interface handles signing, submission, acceptance, finalized success, failure and retry, then reloads canonical state. These paths have client/UI tests. Five primary writes have actual Chrome/OKX evidence; the affected peer uses API as authorized. Alternative refusal/expiry/review-retry actions have local and script evidence, without a claim of extension signatures for those paths.

## Deploy and reproduce on Studio Dev

1. Install the pinned tools and run `npm run check`. Preserve the contract's coherent v0.3.0 runner/API header; source must remain ASCII with exactly one contract class.
2. Configure the three authorized actor secrets in ignored environment files. Scripts discover the project `.env` before an authorized parent `.env`; never put keys in frontend variables, logs or repository files. Existing variable names retain their legacy spelling but all evidence targets Studio Dev.
3. Run `node scripts/inspect.mjs`. It checks both RPC chain identities, configured public actors and balances without exposing secrets.
4. Run `node scripts/smoke.mjs` and `node scripts/deploy-quote.mjs` for a bounded simulation and a current protocol fee quote. Deployment requires a clean source commit and authorized network writes.
5. Run `node scripts/deploy.mjs`. It recovers the existing active deployment; it does not replay a finalized deployment. Confirm both `FINALIZED` and execution `SUCCESS` in the Explorer and canonical schema.
6. Run `node scripts/lifecycle.mjs` only with authorization for the 2 GEN demo purses and protocol fees. It resumes saved hashes and finalized canonical state instead of replaying completed transactions. The recorded lifecycle used three existing EOAs, with no new wallet, faucet or funding transfer.
7. Run `node scripts/verify-lifecycle.mjs` and `node scripts/fee-profile.mjs` to refresh safe receipts, native child proofs, canonical views, zero liability and the measured fee profiles for all nine methods. Reads do not sign transactions.

An active `deployment.json` binds the network, source commit, runtime and address. Superseded revisions are archived explicitly; the clock-broken revision has 0 GEN and no lifecycle writes. No full receipt, validator configuration or signed raw transaction is public. Vercel uses `frontend/`, Vite, `npm run build`, `dist` and the public address variable.

## Limits and next milestone

V1 has exactly three wallet members, bounded constitutive text, one live amendment per charter, 20 charters per wallet and 20 proposals per charter. Transaction origin authenticates exact ratified/proposed records; it does not establish legal identity, real-world ownership or external performance. Semantic consensus is bounded interpretation, with non-penalizing retry for unresolved classifications. There is no legal enforceability, external adoption, cross-chain enforcement or claim of other-network validation.

Browser reads and local real-SDK wallet compatibility tests pass. The selected-wallet primary journey and its native transfer pass; other members use owner-authorized API signatures. An all-member, all-alternative browser lifecycle is not claimed. The owner submitted the Projects application on October 3, 2026; Portal status is Pending review (project 1303). Representative method fee profiles have 50% integer headroom; they do not prove every maximum-size input. The production bundle still has a non-failing size warning.

A future substantial milestone can add impact composition/rebasing for competing amendments and a real agent gateway that enforces the adopted version before execution. Sequential amendments already exist in V1; renaming or restyling them would not constitute that milestone.
