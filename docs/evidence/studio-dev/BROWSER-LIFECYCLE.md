# Owner-authorized primary browser journey

Verified on Studio Dev with `node scripts/verify-browser-lifecycle.mjs`. Five primary writes were signed in Chrome through the actual OKX extension by `0xbd733bc56ec4a55fa25c068b9306b0171335d199`. The owner required that this be the only browser-operated wallet and authorized B/C actions through API. Those three peer writes are labeled separately below. This evidence does not claim all-member or alternative-path browser signatures.

Active contract: [0x18F1689CE9241894433F44b41989C46E45a13DC5](https://explorer-studio-dev.genlayer.com/address/0x18F1689CE9241894433F44b41989C46E45a13DC5). Source commit `aa9ea72bae865b6edcfe54030f08861fc5b0d1e7`. Charter `CD-9f43fd7e-9f7`, amendment `AM-9805f7e0-969`.

| Action | Signing path | Finalized successful parent |
| --- | --- | --- |
| Create charter | Chrome / OKX / A | `0x9c122750df03949b5497b395d8eaa13217430dc38a30a5d572d6cfaf9465775a` |
| Ratify A | Chrome / OKX / A | `0x044d60467797595d2fe8aa92c960a0d0672f367a9a7115d27ff7bcd0a05a1dcd` |
| Ratify B | API / B | `0x725db7fc22535f5b7d22aa0276a2334e77d4f4566b8b32731c8b9bfca283da86` |
| Ratify C | API / C | `0x76441f7e706b35d7330a4dd29614fb414b6e449800dffcd7e7e999b4b675798e` |
| Propose exact amendment with 2 GEN | Chrome / OKX / A | `0x51a068ed5f4cc6579d63c0a4a88b59dcbad49f0e5dcbedaf5b5387851ba0cf11` |
| Request independent impact review | Chrome / OKX / A | `0xa063ad1d05059ce43c4b6a8cc4e0aa5a45926fbd932976fa1cc96ccfdc251352` |
| Approve exact changed terms | API / B | `0x9d96421bb00408bc52901a1cdca486cef7cbd792566c394623f01d0c0586ef86` |
| Withdraw credited 2 GEN | Chrome / OKX / A | `0x64c2fcc795be3d1ed2409330cc101798b95c95d7cffee7b6fa9c7beb4b3d693a` |

The canonical first review covers A/B/C exactly once: A/C `PRESERVED`, B `MATERIAL_CHANGE`. Code derives only B as required; B's revision-bound consent adopts version 2 and credits the fixed proposing wallet. Final accounting: funded 2 GEN, withdrawn 2 GEN, locked 0 GEN, credits 0 GEN, conserved true. The native contract balance is 0 GEN.

The [native withdrawal child](https://explorer-studio-dev.genlayer.com/tx/0x8e489597eb98a2b2225fc85a75e486696095e05a281f84bdc91862fcdd3cffd2) is finalized, bound to the withdrawal parent, sent from the active contract to A, and transfers exactly 2 GEN. Native contract balance decreased from 2 GEN to 0 GEN. Recipient balance changed from 0.17447502750010509 GEN to 2.174348722000103855 GEN after transaction fees. Parent finalization or zero internal credit alone is not transfer proof.

The first withdrawal parent `0x0814c583a1ee128fb6b58c29b711de8177a32aa1eb90a5fb2208561f8b6c5465` finalized with error `Mode1MessageFeesRequireGenVMPerEmissionSupport`: no native child, credit unchanged at 2 GEN. It is retained and excluded from successful counts. Commit `650e16dddab50444e8f6d74b1250c65b37e9a61b` passes a bounded explicit external-message fee allocation from the SDK quote into the wallet write. A real-SDK regression first failed, then passed after repair; unsigned Studio preview succeeded before the successful browser retry. See [failure evidence](browser-withdraw-failure.json).

The main wallet was funded with 2 GEN from an existing authorized Studio Dev account, transaction `0xd07e20e3f3737636f1e546fa9b961c62752624f726cd828a340c68eda24eb6be`; the recipient increase was exactly 2 GEN. No faucet, generated account, injected mock provider or private browser key was used. The user confirmed each wallet transaction. Actual Chrome network was 0xf22d; same-origin IC reads returned HTTP 200 without CORS errors. Explicit wallet selection, logout disabling writes, reconnect and canonical reload were observed.

Fresh verification reads receipt success, sender/contract bindings, deployed source digest, canonical review and consent, accounting, native child and contract balance. [browser-acceptance.json](browser-acceptance.json) contains the safe projection. [browser-lifecycle.json](browser-lifecycle.json) records observed before/after states; [browser-peers.json](browser-peers.json) keeps API provenance separate. The original [script lifecycle](LIFECYCLE.md) proves refusal and expiry as well as three other native 2 GEN withdrawals; these are not relabeled browser actions. No legal identity, external adoption or cross-chain enforcement is asserted.
