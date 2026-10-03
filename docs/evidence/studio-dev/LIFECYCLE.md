# Finalized Studio Dev lifecycle

Verified on 2026-10-03 with `node scripts/verify-lifecycle.mjs`: PASS, 17 parent transactions, three native child transfers, all nine write methods, canonical charter version 2, and zero remaining contract GEN. This is script-signed network evidence. Browser-wallet signing is still `PENDING_REAL_EVIDENCE`.

Active contract: [ConsentDeltaContract](https://explorer-studio-dev.genlayer.com/address/0x18F1689CE9241894433F44b41989C46E45a13DC5). Source commit: `aa9ea72bae865b6edcfe54030f08861fc5b0d1e7`, pinned v0.3 API/Depends identity in `deployment.json`. Explorer displayed deployment FINALIZED and GenVM SUCCESS. The superseded clock-broken revision is archived with 0 GEN and no lifecycle writes.

Deployment receipt summary: Status: FINALIZED; Result: SUCCESS.

Three authorized, distinct wallets co-ratified the original charter. A then proposed an amendment that removed B's free redistribution permission and locked 2 GEN. Normal consensus finalized the classification A=PRESERVED, B=MATERIAL_CHANGE, C=PRESERVED. The canonical proposal required only B's consent; C's action view exposed no consent/reject veto. Charter version 1 remained authoritative until B consented. Version 2 then became canonical and A received the fixed 2 GEN implementation credit.

A second 2 GEN proposal added a weekly reporting duty for B. Validators again identified B as affected. B rejected it: the charter retained version 2 and A received the fixed refund. A third 2 GEN proposal deliberately remained REVIEWABLE beyond its deadline. The public expiry write enforced transaction time itself, closed the proposal and refunded A. A separate unratified charter expired from DRAFT.

Every terminal purse was withdrawn through the EVM recipient interface. Each proof includes a finalized child bound to the parent, contract sender, original funder recipient and exact 2 GEN value, plus a native contract-balance decrease of exactly 2 GEN. Recipient net balance gains account for protocol fees. The final accounting is funded=6 GEN, withdrawn=6 GEN, locked=0 GEN, credits=0 GEN, conserved=true; native contract balance=0 GEN.

| Terminal path | Native child receipt | Value |
|---|---|---|
| Adoption | [0xd5826f71…22a8119f](https://explorer-studio-dev.genlayer.com/tx/0xd5826f71c09ba7fd8d5eb9eb7898cb28e44246312b0772a47f153cbd22a8119f) | 2 GEN |
| Refusal | [0x773e8e56…02590c2](https://explorer-studio-dev.genlayer.com/tx/0x773e8e568260931979f29baac506a36f21e8d65bcd24dcb15834833fd02590c2) | 2 GEN |
| Expiry | [0x5e0e4901…15ba4f6](https://explorer-studio-dev.genlayer.com/tx/0x5e0e490154a257e5c5c3884e3a0e78bce762888c44aeb8c74a724fd4415ba4f6) | 2 GEN |

`lifecycle.json` preserves before/after canonical views, public actors, hashes, observed status timestamps and GEN balances. `lifecycle-acceptance.json` refreshes receipt/child/view proof and dynamically reads the current one-based attempt index from the proposal. Native children come from the official Explorer relations endpoint; the legacy RPC's empty `triggered_transactions` field does not prove absence of a child. No complete RPC receipt, validator configuration, stdout/stderr, signed raw transaction or wallet secret is saved as public evidence.

`node scripts/fee-profile.mjs` measured all nine methods from these 17 finalized transactions, with 50% integer headroom and no invented zero-cost observations. Profiles describe representative bounded calls; they do not claim exhaustive network stress testing. Current public fee prices are quoted again before wallet signing.

The canonical clock uses the pinned SDK's raw transaction datetime and integer date arithmetic. Studio write simulation requires an explicit preview datetime; it otherwise omits the current transaction clock and can reject valid future deadlines. Preview metadata is supplied only to simulation. Signed production writes receive their timestamp from the network. CLI entrypoints suppress raw SDK errors because an exception can carry the entire upstream receipt/configuration.
