# Genuine extension-wallet verification

Status: PENDING_REAL_EVIDENCE. The production browser read proof and script-signed lifecycle are complete. The connected in-app browser has no EVM extension; no injected test provider or private key is used to replace it.

## Prerequisites

Open https://consent-delta-genlayer.vercel.app in a connected browser with an existing EVM wallet extension. The user chooses the wallet in the centered picker and controls any wallet authorization or financial signature. Use authorized existing accounts with enough Studio Dev GEN for one 2 GEN purse and the separately quoted protocol fee. Do not generate or fund another wallet, use a faucet, disclose keys, or assume another network's balance.

The connected address must match its intended member role. The app switches/adds the SDK's current Studio Dev EVM chain before writes. The IC proxy handles reads; the wallet provider handles writes. A connection is not a signed transaction.

## Primary browser journey

1. Create a fresh charter with two distinct peer wallets and complete exact terms. Review the form, sign, wait for finalized SUCCESS and confirm the canonical detail page.
2. Each of the three members opens that same charter, verifies exact terms, and signs its initial approval. Confirm canonical activation after the third member.
3. A member proposes a complete amendment changing another member's permission or duty. Review the **2 GEN** application purse and real quoted protocol deposit separately before signing.
4. Request the independent impact review. Record submitted, accepted/decided and finalized state; confirm canonical per-member impact and derived required consent. An unaffected wallet must not get an arbitrary consent/refusal action.
5. Switch to the affected wallet and approve the exact terms. Confirm adopted next version and fixed proposer credit from canonical reads.
6. The proposer opens Account, checks its actual available GEN credit, signs withdrawal, and confirms finalized state/reloaded credit. Independently verify the native child receipt, its parent/sender/recipient binding, exact contract balance decrease and recipient gain after fees.

Record browser/provider name, public connected address, network, user action, transaction hash, observed status timestamps, canonical views before/after and Explorer link. Never record wallet secrets, full SDK errors, complete receipts or validator configuration. Keep sanitized evidence in `docs/evidence/studio-dev/`.

## Additional boundary proof

Verify a real affected-member refusal and the resulting fixed refund. Verify expiry recovery and expired-draft closure only when their canonical deadlines have passed; do not alter the transaction clock or label a script preparation as a browser user action. Retry is legal only in a canonical retryable state. Record a user rejection/failure and safe reload/retry without replaying an already submitted hash. Verify address-menu disconnect disables writes and explicit wallet selection is required to reconnect.

Every claimed browser action needs its own wrapper/control/test/finality/reload proof; the existing script lifecycle cannot replace it. A genuine completed adoption journey alone should not be mislabeled as proof of all alternative browser actions. Portal-specific video or other fields must be checked in an authenticated session before claiming those requirements complete.
