# ConsentDelta implementation postmortem

The reusable primitive, public product and script-signed Studio Dev lifecycle
are validated. The owner-authorized hybrid primary journey is verified: main actions use
actual Chrome/OKX signatures and peers use API signatures. Final acceptance
checks and Portal submission are recorded separately; no submission confirmation
is invented. See [audit](AUDIT.md), [browser protocol](BROWSER-VERIFY.md) and
[submission packet](SUBMISSION.md) for the exact boundary.

## What was proven

One intelligent contract owns selective affected-member consent and the fixed
purse. Validators independently classify the exact co-ratified old terms and
transaction-authored replacement for all three locked members. Contract code
checks coverage, origin, revision binding and changed roots before deriving
required assent and value destinations. Unaffected members cannot obstruct an
otherwise authorized adoption. Invalid provenance or normalized verdicts cannot
change the canonical revision or move GEN.

The final suite has 127 direct, 24 tooling and 40 frontend tests (191 total),
with semantic lint, TypeScript and production build passing. Live Studio Dev
evidence covers 17 finalized lifecycle parents, all 9 writes, two normal semantic
reviews, and 3 finalized native children of 2 GEN each. Adoption, refusal,
stale-phase expiry and draft expiry were observed. Funded and withdrawn totals
are 6 GEN; locked value, credits and the native balance are all 0 GEN.

Production reads use the same-origin IC proxy. The owner later connected Chrome
and selected OKX at `0xbd733bc56ec4a55fa25c068b9306b0171335d199`, authorizing
main-persona browser actions with peer actions through the existing API wallets.
Charter creation, A ratification, a 2 GEN proposal and semantic review have
finalized through actual user-confirmed OKX signatures. B/C ratification and B
consent are separately labeled script-signed API actions. This hybrid journey is
not relabeled as signatures from all three wallets in a browser.

## Runtime and clock lessons

The concrete Depends runner, Python API family, linter, direct VM and deployed
host must be treated as a versioned unit. An initially deployed revision used a
timestamp host operation unavailable in Studio Dev even though deployment
itself finalized successfully. That zero-value revision is explicitly archived
as abandoned and receives no further funding. The active revision reads the
transaction's raw UTC datetime and computes integer seconds deterministically.
Its exact source commit and runner are bound in deployment evidence.

Direct-mode time warp required synchronizing the actual VM message datetime;
the test adapter does not install a fake production timestamp host operation.
Studio's write-preview simulation omitted datetime by default, so quotes use an
explicit simulation-only UTC datetime. Production transactions never supply a
clock override. Official view execution defaults to current UTC, allowing
canonical action views to become late even when stored phase is stale.

## Finality, accounting and origin lessons

A finalized withdrawal parent and zero internal credit do not prove delivery.
Proof must also identify the finalized native child, bind its triggering parent,
sender, recipient and 2 GEN amount, and show the exact native contract balance
decrease. The older receipt relation field was empty even though the Explorer
relationship API exposed the child; absence in that one field was not evidence
of absent delivery. Lossless JSON number parsing preserves transfer integers
before comparison and rejects already-rounded values.

Append-only attempts are one-based; retry scripts read the current canonical
attempt dynamically. Every recorded lifecycle parent's actual sender and target
are checked against its actor and active contract. Valid-digest but unauthorized
artifact tripwires now cover all four consequential origin paths with hostile
prose, unchanged accounting/canonical state and no extra validator call.

An uncaught SDK error during investigation exposed overly broad RPC diagnostics
to local tool output. That is not acceptable evidence handling. Scripts now
project safe fields and use generic error catches; raw validator configuration
is neither saved in public evidence nor published. Fixture-only privacy
tripwires remain explicitly synthetic.

## Verification before publication

The first actual OKX withdrawal finalized with
`Mode1MessageFeesRequireGenVMPerEmissionSupport`, no native child and unchanged
2 GEN credit. The frontend had submitted aggregate message fees without the
allocation tree used by the working script lane. The real-SDK regression failed
on the old adapter's empty signed ABI allocation list. The repair pins one
external, finalization-only allocation to the selected account and empty native
calldata key, with encoded gas parameters and an exact budget matching its fee
distribution. Studio requires a positive budget that is an integer multiple of
per-call gas capacity, and the distribution total must equal the tree budget.
The measured 500000 gas bound uses the current SDK price cap, failing before
signing if it exceeds measured headroom. Unsigned Studio simulation then returned
SUCCESS. The corrected production retry finalized SUCCESS; its native child transferred
exactly 2 GEN, contract balance decreased by exactly 2 GEN, recipient balance
increased after fees, and credit/accounting closed to zero. This verifies the
repair end to end for the selected Chrome/OKX wallet. The failed parent is preserved and never counted as
a successful transfer. SDK-only mock I/O tests had missed this actual host rule.

A copy change introduced an unescaped apostrophe in TypeScript. Commit
`54177e8` was pushed before its running check's failing result was consumed; its
CI and Vercel build failed. The failed commit is preserved honestly in history.
Corrective commit `3b8bbcd` passed the full local check and CI and restored a
successful production deployment. Vercel retaining its prior good deployment
did not make the failed source commit pass. Future publication gates must wait
for and inspect the actual check exit status before commit or push.

The Projects grader returned 0 BLOCKER/0 WARN without skipping dynamic checks.
Its heuristic score and localStorage warnings were reviewed against real code:
storage holds only a provider preference. The checker was not weakened. A clean
checker is necessary evidence, but cannot itself certify extension-wallet
discovery, chain switching or financial signatures. Those now have separate
Chrome/OKX evidence for the owner-authorized primary journey; peer/API and
alternative script actions remain labeled precisely.

## Next substantial milestone

After V1 is accepted, add competing-amendment impact composition and rebase,
with deterministic conflict/revision rules and new semantic consensus cases;
integrate an actual agent gateway that rejects execution under a superseded or
unadopted charter revision. Measure that integration with real usage evidence.
Sequential revisions and one live amendment are already V1 behavior and do not
qualify as a new milestone. Safe/EVM enforcement additionally requires a proven
authenticated cross-chain authority boundary; it is not currently implemented.
