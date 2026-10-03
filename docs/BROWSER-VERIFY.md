# Genuine extension-wallet verification

Status: VERIFIED_OWNER_AUTHORIZED_HYBRID_PRIMARY_JOURNEY. Chrome/OKX signed five primary writes with wallet `0xbd733bc56ec4a55fa25c068b9306b0171335d199`. The owner explicitly required that only this wallet operate in the browser and authorized peer actions through API. B/C ratification and B consent are therefore separately labeled API signatures. See [live evidence](evidence/studio-dev/BROWSER-LIFECYCLE.md) and run `node scripts/verify-browser-lifecycle.mjs` for fresh receipt, source, canonical-state and native-transfer verification.

## Prerequisites

Open https://consent-delta-genlayer.vercel.app in a connected browser with an existing EVM wallet extension. The user chooses the wallet in the centered picker and controls any wallet authorization or financial signature. Use authorized existing accounts with enough Studio Dev GEN for one 2 GEN purse and the separately quoted protocol fee. Do not generate or fund another wallet, use a faucet, disclose keys, or assume another network's balance.

The connected address must match its intended member role. The app switches/adds the SDK's current Studio Dev EVM chain before writes. The IC proxy handles reads; the wallet provider handles writes. A connection is not a signed transaction.

## Primary browser journey

1. Create a fresh charter with two distinct peer wallets and complete exact terms. Review the form, sign, wait for finalized SUCCESS and confirm the canonical detail page.
2. A approves the exact terms through Chrome/OKX. The authorized B/C accounts approve the same charter through API. Confirm canonical activation after the third member; do not call these peer API writes browser signatures.
3. A member proposes a complete amendment changing another member's permission or duty. Review the **2 GEN** application purse and real quoted protocol deposit separately before signing.
4. Request the independent impact review. Record submitted, accepted/decided and finalized state; confirm canonical per-member impact and derived required consent. An unaffected wallet must not get an arbitrary consent/refusal action.
5. The affected B account approves the exact terms through the owner-authorized API path. Confirm adopted next version and fixed proposer credit from canonical reads.
6. The proposer opens Account, checks its actual available GEN credit, signs withdrawal, and confirms finalized state/reloaded credit. Independently verify the native child receipt, its parent/sender/recipient binding, exact contract balance decrease and recipient gain after fees.

Record browser/provider name, public connected address, network, user action, transaction hash, observed status timestamps, canonical views before/after and Explorer link. Never record wallet secrets, full SDK errors, complete receipts or validator configuration. Keep sanitized evidence in `docs/evidence/studio-dev/`.

## Additional boundary proof

The separate script lifecycle proves affected-member refusal, fixed refund, expired proposal recovery and expired-draft closure. Their frontend wrappers, controls and tests exist, but alternative browser signatures are not claimed. Review retry is legal only in a canonical retryable state. The live browser proof retains a finalized failed withdrawal with unchanged 2 GEN credit and no native child, then a distinct successful retry after fixing the external-message fee allocation. Actual provider selection, address-menu disconnect, reconnect and canonical reload were observed on Chrome.

Every claimed browser action needs its own wrapper/control/test/finality/reload proof; the existing script lifecycle cannot replace it. A genuine completed adoption journey alone should not be mislabeled as proof of all alternative browser actions. Portal-specific video or other fields must be checked in an authenticated session before claiming those requirements complete.
