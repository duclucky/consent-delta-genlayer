# ConsentDelta specification

## Identity

- Idea: IDEA-035; project/slug: ConsentDelta / consent-delta.
- Category: Projects. Status: BUILDING (full specification locked; implementation/live evidence pending).
- Repository target: https://github.com/duclucky/consent-delta (not yet published).
- Network: Studio Dev, chain 61997; runtime/template compatibility verified read-only.

## One-sentence product hook

Change a shared charter with the consent of the people whose rights change.

## Trust problem

A proposing majority must not exclude an affected member from approving a change to that member's existing constitutive rights. A private LLM backend can misclassify the affected set. GenLayer validators independently interpret exact locked text, and contract code requires exact revision-bound consent before changing canonical terms.

## Fingerprint

- Trust problem: protect affected minority consent before shared charter revision.
- Actors/adversary: three fixed wallet members; proposer hides effects, affected member protects rights, unaffected member may obstruct.
- Evidence class + authenticity mechanism: bounded constitutive terms ratified by all members by transaction; exact proposal from an authorized member, bound to current version/digest/time.
- Consensus question: for every expected member, are stated permissions/prohibitions/duties preserved, materially changed or ambiguous?
- State machine: DRAFT -> ACTIVE charter; REVIEWABLE/RETRYABLE -> CONSENT_REQUIRED -> ADOPTED/REJECTED/EXPIRED amendment; immutable versions and attempts.
- Direct consequence: derived affected-member consent controls canonical adoption and a fixed 2 GEN proposer credit/refund.
- Reuse surface: charter/proposal/action/revision views and authenticated ratify/propose/review/consent/reject/expiry/withdraw writes.

## Mandatory gate matrix

All fourteen design admission gates passed before registration. Admission is distinct from implementation/live completion.

| Gate | PASS/FAIL | Evidence/reason |
|---|---|---|
| Replacement | PASS | A signed database/private LLM can exclude an affected member; validator consensus and exact authenticated assent jointly own canonical adoption. |
| Judgment | PASS | Meaning-preserving paraphrases and new duties require semantic interpretation, beyond string diff. |
| Evidence availability | PASS | Every bounded constitutive byte is canonical onchain input; target-runtime read-only probe executed classification twice and fetched W3C HTTP 200. |
| Evidence authenticity | PASS | All consequential inputs have complete transaction-origin/actor/entity/version/time authority rows below; external facts are excluded. |
| Equivalence | PASS | Independent complete per-member classifications; normalized binding/coverage/root IDs checked deterministically. |
| Consequence | PASS | Impact-derived consent directly controls canonical revision replacement and fixed 2 GEN proposer credit/refund. |
| Adversarial | PASS | Proposer may hide impact; affected member protects rights; unaffected member may obstruct. |
| State model | PASS | Isolated charters/proposals, immutable versions/attempts, exact deadlines on each write, one live proposal, explicit every-terminal value destination. |
| Reuse | PASS | DAOhaus charter UI, Safe governance planning app and LangGraph multi-organization gateway can call the documented native interface. These are potential integrations, not adoption. |
| Contract count | PASS | Exactly one owner of constitutive state, judgment, consent and accounting; no mirror consumer. |
| Differentiation | PASS | Impact-derived minority consent and revision adoption differ in question/state/consequence/reuse from nearest primitives below. |
| Claim-to-code | PASS | All product claims have complete method/view/test/planned evidence rows. |
| Full lifecycle | PASS (design admission) | Entire browser workflow is mapped. Actual extension-wallet and finalized lifecycle proof remain required and pending. |
| Scope honesty | PASS | Three wallets, bounded constitutive terms, fixed purse; no legal identity/enforceability, offchain performance, cross-chain proof or adoption claim. |

## Actors, roles and incentives

The creator is member A and names two distinct other wallets B/C. All three ratify the exact baseline. Any member can propose an amendment and fund its 2 GEN purse. Validators classify every member. Only affected members can approve/refuse; proposing the exact bytes records the proposer's own assent. Unaffected members cannot veto. Anyone can trigger expired recovery, but only the fixed funder receives its refund. Each credit owner withdraws its own credit.

## Scope and non-goals

V1: three wallet identities, bounded per-member natural-language terms, one active amendment per charter, semantic impact classification, selective consent, version adoption, fixed 2 GEN purse, deterministic expiry/refund, pull withdrawal and canonical history.

Excluded: real-world legal identity/enforceability, title/ownership proofs, alleged external performance, token voting, arbitrary payouts, cross-chain native proof, external adoption and legal advice. W3C ODRL terms provide normative vocabulary only.

## Contract-capability sketch

| Human action | Minimum canonical view data | Product state | Value/finality | Recovery |
|---|---|---|---|---|
| Create a charter with two peers | Membership bounds and network/connection | Awaiting member approval | No purse; signed write -> submitted/accepted/finalized -> reload | Preserve entered text on failure; no pretend charter |
| Ratify exact initial terms | All members, exact terms/digest, activation deadline, own ratification | DRAFT before deadline | Signed approval; activation only after all three | Expired unratified charter cannot activate |
| Propose complete revised terms | Current version, all exact terms, active proposal, proposer membership | ACTIVE, no live amendment | Exactly 2 GEN plus quoted network fee; finalized reload | Failed transaction retains form; no optimistic purse |
| Request/retry impact review | Exact before/after terms, proposal state/deadline | REVIEWABLE or RETRYABLE | Signed review; validators classify; no model-selected amounts | Retry only when canonical state permits; ambiguous output changes no revision/credit |
| Approve or refuse an affected revision | All three impact labels, exact revision digest, own eligibility/deadline | CONSENT_REQUIRED | Signed exact assent; required complete set adopts | Refusal refunds funder; unaffected wallets get no veto |
| Recover expired purse | Canonical live state, deadline and funder | Live amendment at/after deadline | Signed expiry opens only fixed funder's refund credit | No double credit; adoption retains canonical revision |
| Withdraw own credit | Own canonical GEN credit and transfer status | Any unlocked positive credit | Debit before transfer; finalized canonical reload | Receipt and native balance decrease required for live proof |

## Product/frontend blueprint

### Human users and jobs

Members need to agree on an initial charter, understand exact changes, approve changes affecting them, revisit adopted versions, and recover available GEN. The proposer needs to prepare a clear complete amendment, request independent review and identify remaining consent. The credit owner needs to confirm and withdraw a canonical implementation credit or refund.

### Information architecture

| Route | Purpose / primary action | Required data and states | Mobile behavior |
|---|---|---|---|
| `/` | Understand value; start or find a charter | Clear explanation, first-use CTA, live-configuration notice | Single-column hero and process, no decorative metrics |
| `/charters` | Revisit charters; search title and filter status | Canonical member-charter list; loading, empty, error/reload, success; wallet-less guidance | Stacked summaries, wrapped search/filter |
| `/charters/new` | Create initial terms with two peers | Accessible member/term fields; review-before-signing step; input/error/submitted/accepted/finalized | Step flow, full-width labels/actions |
| `/charters/:id` | Understand current charter and history; ratify or amend | Canonical members, terms, version, ratification/deadline, proposal history/actions | Terms stack in member order; history links remain visible |
| `/charters/:id/amend` | Prepare complete replacement terms; review purse/fee before signing | Exact current version/terms, eligible membership, no live proposal; input/error/wait states | Before/after panels stack; preserve unsent inputs |
| `/charters/:id/proposals/:proposal` | Understand impact and act on required consent | Exact old/new terms, normalized classes and assent, eligible actions, deadline, finality | Member comparison blocks stack; contextual actions follow content |
| `/account` | See connected wallet and available credits; disconnect/withdraw | Wallet identity, selected provider/network, canonical own credits, waiting/error/reload | Address wraps; credit actions remain accessible |
| `/help` | Learn consent, ambiguity, expiry, GEN and evidence limits | Honest explanation, network/configuration help and source links | Readable text measure, native accessible disclosures |

Persistent navigation: brand/home, Charters, Account, Help; current location indicated. Detail links and back links preserve predictable navigation. No system console or one-screen dashboard.

### Visibility matrix

| Group | Visibility | Eligibility | User need |
|---|---|---|---|
| Exact member terms, proposed changes, impact labels, required assent, current version | USER_PRIMARY | Reader | Make an informed consent decision |
| Create, ratify, propose, review/retry, approve/refuse, expire and withdraw | USER_PRIMARY | Canonically eligible connected member/credit owner | Complete the current job; never expose a method list |
| GEN purse/credit, deadline and submitted/accepted/finalized/failed feedback | USER_PRIMARY | Affected workflow | Understand money, timing and completion |
| Address, digest, transaction/contract Explorer links, source context | USER_CONTEXTUAL | Optional details | Verify exact bytes and consequence |
| Raw enums, attempt identifiers, complete validator output/configuration, reviewer packet | SYSTEM_ONLY | No product access | Not needed for user decisions; never render private material |

### UI action matrix

| Visible control | Contract capability/method | Eligible role | Legal state | Input/value | Finality | Failure/recovery |
|---|---|---|---|---|---|---|
| Sign and create charter | create_charter | Creator becomes A | Unique unused charter ID | Title, B/C addresses, three terms, activation deadline; 0 GEN purse | Finalized SUCCESS then charter read | Retain form; submitted hash status read before retry |
| Approve initial terms | ratify | One fixed member | DRAFT, own approval absent | Charter/current digest; 0 GEN | Finalized SUCCESS then charter/actions read | Exact digest or time failure leaves initial state unchanged |
| Sign and lock 2 GEN | propose_amendment | Fixed member | ACTIVE, no live proposal | Charter/proposal/current version+digest, three new terms, deadline; 2 GEN | Finalized SUCCESS then proposal/actions read | No optimistic purse or proposed-current terms |
| Request / try impact review | review | Fixed member | REVIEWABLE or RETRYABLE | Exact charter/proposal; 0 GEN | Accepted/decided then finalized SUCCESS; proposal/actions read | RETRYABLE stays non-penalizing; failure retain prior version/purse |
| Approve these exact terms | consent | Required affected member other than proposer | CONSENT_REQUIRED, own approval absent | Charter/proposal/proposed digest; 0 GEN | Finalized SUCCESS; proposal and charter read | Wrong binding/late/duplicate cannot alter consent/credit |
| Decline amendment | reject | Required affected member other than proposer | CONSENT_REQUIRED, own approval absent | Same exact binding; 0 GEN | Finalized SUCCESS; proposal/charter/credit read | Rejection opens only funder refund; stale refusal reverts |
| Recover expired purse | expire | Any caller | Any live proposal at/after deadline | Charter/proposal; 0 GEN | Finalized SUCCESS then credit/state read | One refund; earlier/terminal call reverts |
| Close expired charter | expire_charter | Any caller | DRAFT at/after activation deadline | Charter; 0 GEN | Finalized SUCCESS then charter read | No active/value state affected; earlier/duplicate call reverts |
| Withdraw credit | withdraw | Credit owner | Positive credit in this charter | Charter; 0 GEN input | Finalized successful transfer and canonical credit read | Ledger debit precedes transfer; no duplicate; exact balance decrease required in evidence |

Until address configuration, writes remain disabled with an explicit reason. Only `get_actions` availability controls contextual legal actions. Every write shows real submitted, accepted/decided, finalized, failed and retry guidance; completion reloads canonical views. A local form review is not a semantic verdict.

### User-facing state language

`DRAFT`: Awaiting member approval. `ACTIVE`: Current charter. `REVIEWABLE`: Ready for impact review. `RETRYABLE`: Review needs another attempt. `CONSENT_REQUIRED`: Waiting for affected members. `ADOPTED`: Amendment adopted. `REJECTED`: Amendment declined. `EXPIRED`: Amendment expired. `PRESERVED`: Rights unchanged. `MATERIAL_CHANGE`: Consent required. `AMBIGUOUS`: Impact unclear. Raw values stay in the adapter.

### Wallet and connection behavior

Scan EIP-6963 plus injected compatible providers (including OKX/Rabby/MetaMask/Coinbase/Brave when present). Present a centered, keyboard-operable wallet picker; never auto-select. Keep selected provider/address in memory. Clicking the connected address opens a disconnect menu; logout disables writes immediately. Selected EVM provider handles wallet writes after current official chain switch/add; IC reads use a same-origin proxy. Actual SDK adapter validation is mandatory before writes. No secret in frontend or localStorage; no mock signature, balance, fee or finality.

### Visual preservation constraints

The project-local ui-ux-pro-max engine was invoked before source creation. Verified Soft UI Evolution, calm indigo/green and Plus Jakarta Sans are implemented across all eight routes. The unmatched Operations Landing recommendation was explicitly excluded. The Phase 3B baseline is locked in [design](DESIGN.md) and [local verification](evidence/local/frontend-baseline.json). Preserve visual language, tokens, typography, components, navigation and page arrangement. Later corrections are functional/accessibility only. Reviewer material stays outside the product surface.

## State model

### Stable IDs and structured storage

Caller-authored bounded ASCII IDs: charter `CD-*`, proposal `AM-*`; 3–48 characters, `[A-Za-z0-9_-]`. Canonical proposal key is `charter_id + ':' + proposal_id`; validation excludes `:` in user IDs. Member IDs are exactly A/B/C; addresses are distinct and nonzero. Creation identity is unique and immutable. No global last-result field.

Class-body typed persistent maps hold charter title/phase/current version/digest/deadline; member addresses and exact versioned per-member terms; initial ratifications; one current live proposal; ordered proposal IDs; proposal base version, fixed proposer, exact new terms/digest/deadline/phase; per-member required/approved/impact state; append-only attempt binding/classes/result; per-charter/per-wallet credits and cumulative accounting; per-member charter index. No raw JSON registry or arbitrary stored model object. JSON is bounded transient prompt/return serialization only.

V1 bounds: title 3–80 characters; each member's terms 10–700 ASCII characters; exactly three members; initial/proposal interval 30 seconds through seven days; at most 20 charters per wallet and 20 proposals per charter. Explicit caps permit bounded canonical list/history reads; expansion is future scope, not an unbounded claim.

### State machine

```text
Charter: DRAFT --all three exact ratifications before deadline--> ACTIVE
         DRAFT --expire_charter at/after deadline--> EXPIRED

Amendment: REVIEWABLE --review before deadline--> CONSENT_REQUIRED
           REVIEWABLE/RETRYABLE --unclear/invalid review--> RETRYABLE
           CONSENT_REQUIRED --all derived affected approvals--> ADOPTED
           CONSENT_REQUIRED --required unapproved member refuses--> REJECTED
           REVIEWABLE/RETRYABLE/CONSENT_REQUIRED --expire at/after deadline--> EXPIRED
```

A complete preserved-only review may adopt immediately: no member's rights change, and the proposer's exact assent is already recorded. A complete changed set containing only the proposer also adopts after review. Otherwise every affected non-proposer must consent. Initial ratification is approval of revision 1, not a claim that every later revision received three fresh approvals.

Terminal adoption writes a new immutable version, increments current version, assigns its recomputed digest, clears the live-proposal pointer and opens fixed proposer credit once. Rejection/expiry retain the current version, clear the pointer and open fixed proposer refund once. Old proposals/terms/attempts are never overwritten by later proposals.

### Temporal rules, authorization and idempotency

Canonical clock: `gl.message.datetime.timestamp()`, transaction-bound, never host time. Deadline equality is late: every ratify/propose/review/consent/reject write checks its own `now < deadline` before mutation. Propose also requires its new deadline in `[now+30 seconds, now+7 days]`; activation deadline uses the same interval. Recovery enforces `now >= deadline` directly even when phase is stale. A caller need not run a phase-advance helper. Withdraw is deliberately non-temporal so credits never become orphaned.

Creation locks membership. Ratify accepts only a named member, exact recomputed current baseline digest and unused approval. Propose is member-only and requires current ACTIVE version/digest, no live proposal, valid bounded replacement terms and exactly 2 GEN. Review is member-only and checks current live pointer, base version/old digest and exact recomputed proposed digest before nondeterminism. Consent/reject require membership in the derived affected set, excluding already assented members and proposer; both bind exact new digest. Expiry is public, time-gated and refunds only the fixed funder; arbitrary caller destinations are impossible. Withdraw is credit-owner-only.

Duplicates revert before mutation rather than reapply. Terminal proposals reject any further review/consent/reject/expire. Active/expired charters reject initial ratification. A stale-base amendment cannot be adopted. Tooling reads current views and recovers already-finalized actions before retrying a signed transaction.

## Write-method safety matrix

| Method | Caller | Allowed states | Forbidden states | Temporal/expiry gate | Idempotency | Value/accounting effect | Views affected | Negative tests |
|---|---|---|---|---|---|---|---|---|
| create_charter | Any valid sender, becomes A | Unused ID, B/C distinct/nonzero, index below cap | Existing ID; invalid members/terms/caps | Direct new deadline within 30 seconds–7 days | Existing ID reverts | Nonpayable; no purse/accounting change | get_charter/get_charters/get_actions | Duplicate, invalid IDs/addresses/size, value metadata, deadline lower/upper bounds |
| ratify | Named member | DRAFT, own approval false, exact baseline digest | ACTIVE/EXPIRED; outsider; duplicate/mismatch | Direct now < activation deadline; equality late | Duplicate reverts | No GEN; only final third approval activates | get_charter/get_actions | Wrong caller/state/digest; -1/equal/+1 stale phase; unchanged accounting |
| propose_amendment | Named member/funder | ACTIVE, no live proposal, exact current version/digest | DRAFT/EXPIRED; outsider; stale base; duplicate/live/cap | Direct ACTIVE charter plus new deadline interval; exact current proposal creation time | Duplicate/live ID reverts | Exactly 2 GEN increases funded+locked totals; no credit | get_charter/get_proposal/get_actions/get_accounting | Wrong caller/state/base/objective; 0/1/3 GEN; duplicate; new time bounds; no orphaned purse |
| review | Named member | Live REVIEWABLE/RETRYABLE, valid canonical input bindings | Terminal/consent pending; outsider; stale base/pointer/digests | Direct now < proposal deadline | Append one attempt; terminal/late duplicate rejects | Only retry record on ambiguity; complete review derives required consent; adoption credits fixed 2 GEN once | Proposal/charter/actions/attempt/accounting views | Wrong caller/state/time; malicious leader/root/IDs/enums/binding; ambiguity/exception; unchanged money on rejection |
| consent | Required affected member, not already approved | CONSENT_REQUIRED, exact digest/current base/live pointer | Outsider/unaffected/proposer/already-approved/terminal/stale | Direct now < proposal deadline | Duplicate reverts | Last required assent adopts once, locked -> fixed proposer credit | Charter/proposal/actions/credits/accounting | Wrong caller/state/digest; -1/equal/+1 with stale phase; no double adoption/credit |
| reject | Required affected member, not already approved | CONSENT_REQUIRED, exact digest/current base/live pointer | Outsider/unaffected/proposer/already-approved/terminal/stale | Direct now < proposal deadline | Terminal rejection reverts on repeat | Locked -> fixed funder refund credit; revision unchanged | Proposal/charter/actions/credits/accounting | Wrong actor/state/digest/time; no arbitrary refund destination or double credit |
| expire | Any sender | Live REVIEWABLE/RETRYABLE/CONSENT_REQUIRED and purse locked | Terminal/missing/stale pointer/base | Direct now >= proposal deadline, equality included | Second expiry reverts | Locked -> fixed funder 2 GEN credit; unchanged revision | Proposal/charter/actions/credits/accounting | Earlier -1; exact/+1 stale phase; unrelated caller cannot redirect; terminal/duplicate; conservation |
| expire_charter | Any sender | DRAFT, no purse | ACTIVE/EXPIRED/missing | Direct now >= activation deadline | Repeat reverts | Zero GEN; no financial ledger exists before amendment | Charter/actions | Earlier/wrong state/duplicate; exact/+1 stale phase; state unchanged on rejection |
| withdraw | Exact credit owner | Own positive charter credit, accounting invariant holds | Zero/missing/duplicate credit; wrong owner's request impossible | N/A: perpetual pull credits; withdrawal must remain available after proposal expiry/terminal states | Debit to zero before external message; repeat rejects | Credit total decreases, withdrawn cumulative increases; EVM recipient boundary emits same native amount | get_credit/get_credits/get_accounting | Wrong owner, zero/duplicate, accounting mismatch, terminal refund/adoption withdrawal, debit-before-message; exact native balance decrease live proof |

## Frontend lifecycle coverage matrix

| Canonical state | User action | Contract write | UI component | Frontend test | Evidence status |
|---|---|---|---|---|---|
| Unused -> DRAFT | Create reviewed initial charter | create_charter | CharterForm, review step | creates reviewed charter wrapper + canonical detail reload | Local test PASS; browser transaction PENDING |
| DRAFT -> ACTIVE | Approve baseline | ratify | CharterDetail contextual action | ratify exact digest/target + finality/reload | Local test PASS; browser transaction PENDING |
| ACTIVE -> REVIEWABLE | Lock amendment purse | propose_amendment | AmendmentForm, complete replacement review | complete terms/current binding/exact 2 GEN + reload | Local test PASS; real SDK/browser PENDING |
| REVIEWABLE -> CONSENT_REQUIRED | Review impacts | review | ProposalDetail | exact review target + finality/reload | Local test PASS; independent finalized consensus PENDING |
| RETRYABLE -> review | Retry | review | ProposalDetail contextual retry | canonical retry state selects review + reload | Local test PASS; browser retry proof PENDING |
| CONSENT_REQUIRED -> ADOPTED | Give affected assent | consent | ProposalDetail | exact proposed digest and contextual eligibility | Local test PASS; browser transaction PENDING |
| CONSENT_REQUIRED -> REJECTED | Decline | reject | ProposalDetail | exact digest/refusal + reload | Local test PASS; browser transaction PENDING |
| Live -> EXPIRED | Recover purse | expire | ProposalDetail | exact expiry target + reload | Local test PASS; time-bound browser proof PENDING |
| DRAFT -> EXPIRED | Close unratified charter | expire_charter | CharterDetail | expired closure target + reload | Local test PASS; browser proof PENDING |
| Credit -> withdrawn | Withdraw GEN | withdraw | Account | exact charter/value-zero input + reload | Local test PASS; child receipt/native balance/browser proof PENDING |
| Any | Disconnect/reconnect/read/search/help | No write | Persistent navigation/WalletContext/Charters/Help | explicit provider selection, disconnect, unavailable, search/read error routes | Local tests + wallet-less browser PASS; genuine extension-wallet PENDING |

## Evidence policy

Canonical objective is exact charter revision adoption, never artifact prose. Authoritative source is transaction-authenticated constitutive state in this contract. Authorized attestors are precisely the three locked wallet addresses acting as members, not a website, model or operator. Transaction sender and recipient authenticate origin; chain transaction time supplies freshness; unique IDs/current version/digests/approval bits prevent replay. No external legal, ownership, performance, receipt or credential fact is admitted.

Policy/source identity: fixed interpreter rule in deployed source+runner hash, immutable membership, current baseline version/digest, exact old/new terms and proposal digest. Domains/URLs/signature formats are N/A for constitutive evidence: no arbitrary fetched artifact or offchain attestation endpoint exists. The dated W3C ODRL page is referenced in docs for vocabulary only; it is not fetched as proof of a member's entitlement in production.

The consequential method recomputes digests from the exact stored bytes used in review. A mismatch yields a non-penalizing retryable attempt without adoption/credit. Missing/contradictory semantics or runtime/parser/model failure are RETRYABLE; invalid deterministic caller/state/binding reverts before mutation. The only permitted hard-state change on unclear evidence is the explicit retry attempt/phase record. A correct digest of forged/misbound constitutive state cannot bypass exact origin/ratification/current-base checks.

Bounds are explicit above; stored terms are immutable per revision/proposal, so no HTTP freshness estimate is substituted for transaction time. All artifact text is untrusted prompt data; it cannot supply authority, member IDs, new states, recipients, payout, deadline or settlement rules. Private/unverifiable external evidence is excluded.

### Evidence Authority Matrix

| Consequential claim/fact | Evidence/artifact | Data controller | Authoritative source/issuer | Deterministic verification | Canonical objective/entity/actor binding | Freshness/anti-replay | Semantic role after verification | Non-penalizing failure state | Consequence blocked | Required negative test |
|---|---|---|---|---|---|---|---|---|---|---|
| Exact initial charter governs these three members | Exact three terms, locked addresses, full digest | Creator proposes; every member may refuse | Each locked wallet's own ratification transaction | Distinct/nonzero members; sender maps to fixed member; recomputed full digest; all three approvals | This contract's transaction recipient, charter ID, version 1, ordered member IDs/addresses, digest | Each member approves once before activation deadline; exact equality late; no cross-ID/revision replay | Define constitutive baseline, not a real-world fact | Revert without ratification/GEN mutation; DRAFT remains | Activation, semantic review, amendment adoption, credits | Valid bytes/digest with wrong actor/charter/version, stale/future validity; assert state/accounting unchanged |
| Exact amendment is authored/assented by the fixed member/funder | Complete new terms, base version/digest, proposal digest/time | Proposing member | Transaction sender in immutable membership | ACTIVE current baseline; current digest recomputed; exact 2 GEN; unique proposal and one live pointer; bounded terms/deadline | Contract recipient, charter/proposal, exact current base, proposer address, new bytes/digest | Chain-time bounded deadline; unique append-only ID; no old revision or active-proposal overwrite | Compare proposed constitutive meaning only | Revert before funding/mutation or RETRYABLE for stored-byte mismatch | Derived consent rights, adoption, GEN credit | Valid bytes/digest from wrong origin/objective/base/member or replay cannot lock or move GEN or revise charter |
| Affected member assents/refuses exact revision | Member transaction and exact proposal digest | Only that member | Fixed member's transaction sender | Required-set membership; unapproved/non-proposer; exact new digest/current base/live pointer | Charter/proposal/current version, fixed member/address, exact new digest | Direct pre-deadline guard; approval once; terminal/stale proposal rejected | None: assent is deterministic, never inferred by model | Revert before approval/refund/adoption | Revision, credits, refusal settlement | Correct digest from unaffected/wrong/old member or wrong entity/time leaves GEN/revision/approvals unchanged |
| Complete impact verdict over authenticated bytes | Normalized bindings, three impact rows and changed-member roots | Leader; independent validator recomputes classification | GenVM consensus with independent semantic replay | Complete expected IDs exactly once; bounded enums; exact binding; roots equal changed classes; ambiguity fail-closed | Canonical charter/proposal/base/new digest and fixed A/B/C identities constructed from locked state | Current live proposal/base only, pre-deadline, append-only attempt; terminal replay rejects | Classify complete per-member effects; no actor/funder/payout inference | RETRYABLE attempt only; no accounting/version change | Required consent creation, adoption, credit/refund | Valid-shape malicious roots/extra/missing/duplicate/invalid enum/wrong binding/injection cannot reach consequence |

## Consensus design

Leader reads exact current/proposed complete term sets and fixed member identities from canonical state after authentication/digest checks. It executes a bounded LLM classification inside sandboxed `gl.vm.run_nondet_default`. Compare the whole charter for each member: another member's clause can change that member's rights. Permission restriction/expansion, new/removed prohibition or changed duty is MATERIAL_CHANGE; meaning-preserving paraphrase is PRESERVED; missing/contradictory/insufficient interpretation is AMBIGUOUS. Imperatives in text are untrusted data.

Model returns `coverage:[{member_id,impact}]` and `changed_member_ids`. Unknown noncore prose is excluded during normalization. Core types, IDs, duplicate count, enums and root semantics must be valid; no coercion of booleans/numbers into IDs. Normalized result also contains charter ID, proposal ID, integer base version and proposed digest, supplied from locked context and verified before consequence.

| Consensus-critical field | Bounds | Comparison | Why critical |
|---|---|---|---|
| charter_id/proposal_id/base_version/proposed_digest | Exact locked identifiers/version/recomputed digest | Exact after deterministic validation | Cannot settle another objective or stale bytes |
| coverage.member_id | Exactly A/B/C once, canonical order after normalization | Exact set and per-ID match | No member may disappear or be added |
| coverage.impact | PRESERVED / MATERIAL_CHANGE / AMBIGUOUS only | Independent class meaning agrees for each ID | Determines who must consent |
| changed_member_ids | Sorted unique exact MATERIAL_CHANGE member set | Exact derived root set | No fake affected roots or hidden material change |

Validator rejects a non-Return/malformed leader. It independently runs the same classification on the same canonical bytes, validates its own complete output, and compares normalized per-member semantic labels and changed roots. It never accepts shape-only proof. Narrative wording is not consensus-critical and is not used for settlement. Runtime/equivalence failure resolves non-penalizing RETRYABLE through the safe catch boundary, never simulated finalized status.

### Settlement invariants before any consequence

| Boundary | Coverage / exact IDs | Enums / roots | Dependency relation | Derived consequence | Value destination / residual | Invalid behavior |
|---|---|---|---|---|---|---|
| Impact acceptance | Exact authenticated baseline/new bytes; all expected A/B/C once; exact objective/base/digest | All three allowed impact enums; changed roots equal every and only MATERIAL_CHANGE row | N/A: no downstream/inherited class exists; arbitrary class/path rejected | Any AMBIGUOUS -> RETRYABLE; otherwise code sets affected consent requirements | No money on classification alone unless all required assent already present | RETRYABLE only; accounting/version unchanged |
| Adoption | Complete valid impact; all derived affected IDs approved; proposer exact assent recorded; current base/live pointer | No ambiguity; no extra/missing/duplicate requirements | Every required consent belongs to its own validated direct impact row | Code advances one canonical version, never model-supplied state | Exactly locked 2 GEN -> fixed proposer credit; residual 0 GEN | Revert before credit/version write |
| Refusal / expiry | Exact proposal/live base, authorized required refuser or direct expiry timestamp | Terminal class derived by contract code, no model control | N/A: recovery does not infer fault | Retain prior charter; clear pointer once; terminal refund | All locked 2 GEN -> fixed funder credit, residual 0 GEN | Revert before credit/state mutation |
| Withdrawal | Exact own positive credit and charter conservation | No model at boundary | N/A | Debit credit then EVM transfer message once | Entire own credit -> exact sender; no arbitrary destination/rounding | Revert on zero/accounting error; live transfer proof mandatory |

## Consequence and accounting

| Verdict/path | Canonical change | Consumer action | GEN effect |
|---|---|---|---|
| Any ambiguous/invalid review | Append retry attempt only | Keep current revision; allow bounded retry | No credit/revision/value movement |
| Complete impact with pending affected assent | Record derived consent set | Required members decide exact bytes | Purse remains locked |
| Complete impact plus sufficient exact assent | ADOPTED; increment immutable current version | Read canonical adopted version before dependent work | Fixed proposer 2 GEN credit |
| Required refusal | REJECTED; retain baseline | No new revision authority | Fixed funder 2 GEN refund credit |
| Direct deadline expiry | EXPIRED; retain baseline | No new revision authority | Fixed funder 2 GEN refund credit |

Value destination matrix:

| Value item | Payer/source | Locked state | Release/refund destination | Terminal/retry/duplicate policy | Canonical proof |
|---|---|---|---|---|---|
| Amendment purse 2 GEN | Exact authorized proposer transaction | One proposal; fixed funder/address and exact 2 GEN | Adoption implementation credit or rejection/expiry refund, both fixed funder | Retry retains; every terminal branch allocates all; duplicate rejects | get_proposal/get_credit/get_accounting |
| Credit | Terminal purse allocation | Charter/address ledger | Only exact owner withdrawal | No expiry; debit once; no arbitrary recipient or double transfer | get_credit/get_credits/accounting + child receipt/native balance |
| Network fee | Calling wallet's actual SDK quote | Protocol fee distribution, not application purse | Protocol-controlled validators/execution | Exact measured quote supplied; fees never invented/gasless assumed | Safe fee cap/policy/receipt allowlist in evidence |
| Application fee/bond/reward/rounding remainder | N/A: no such balance in v1 | N/A: no hidden ledger | Residual 0 GEN; fixed whole-GEN purse | No slashing/forfeit/percentage arithmetic exists | Conservation view |

Per-charter invariant, in native units internally and GEN in human-facing views: `funded = locked + outstanding_credits + withdrawn`; all nonnegative. Every terminal proposal's locked value is 0; before terminal it is exactly 2 GEN. Settlement checks conservation before mutation. Pull withdrawal uses the `@gl.evm.contract_interface` EOA boundary, debits first and transfers the same amount. Parent finalized plus zero internal credit alone is not transfer proof: require successful child message, exact contract native balance decrease and recipient/native balance evidence. No cure/slash/appeal/callback exists; adding one would require a separate full specification.

Accepted/finalized boundary: judgment and subsequent ledger/revision transitions are authoritative contract execution under consensus; UI/consumers use finalized successful canonical reads before claiming completion. An accepted decision may still await finality. UNDETERMINED never grants a fake finalized revision.

## Reusable interface

Writes (all nonpayable except the explicitly marked proposal):

- `create_charter(charter_id, title, member_b, member_c, terms_a, terms_b, terms_c, activation_deadline)`.
- `ratify(charter_id, baseline_digest)`.
- **Payable:** `propose_amendment(charter_id, proposal_id, base_version, base_digest, terms_a, terms_b, terms_c, deadline)`; exactly 2 GEN.
- `review(charter_id, proposal_id)` supports REVIEWABLE/RETRYABLE.
- `consent(charter_id, proposal_id, proposed_digest)` and `reject(...)`.
- `expire(charter_id, proposal_id)`, `expire_charter(charter_id)`, `withdraw(charter_id)`.

Views: `get_charter`, `get_charters(account)`, `get_proposal`, `get_actions(charter, proposal_or_empty, account)`, `get_attempt(charter,proposal,attempt)`, `get_credit(charter,account)`, `get_credits(account)`, `get_accounting(charter)`. List outputs are bounded by explicit caps. GEN views return whole GEN values, current charter version/digest/members/terms, immutable amendment before/after/impacts/assent, and legal action IDs for adapter use. UI maps IDs to user labels.

Consumer/callback: N/A, one primitive owner only. Downstream native adapters can read canonical revision and request authorized writes. No pass-through contract, callback authentication placeholder or cross-chain proof is invented. A later external enforcement gateway must document its actual trust boundary and idempotency.

## Threat model

| Threat | Attack | Mitigation | Test |
|---|---|---|---|
| Exclude affected member | Leader returns only two rows or false preserved class | Exact coverage plus independent validator replay | Missing/extra/duplicate and semantic disagreement tests |
| Invent root or payout | Shape-valid output roots mismatch classes; text requests attacker amount/address | Code derives affected set, state and fixed amount/recipient | Root mismatch, invalid enums, injection, unchanged accounting |
| Forge constitutive authority | Valid terms/digest with wrong caller/entity/version or fake hosted licence | Immutable membership, exact tx origin/base/digest; no external artifact interface | Per-class provenance tripwires |
| Replay or race | Old digest after current version advances; repeated approve/refund/withdraw | One live proposal, exact current-base checks, terminal guards, ledger debit | Cross-charter, stale version, duplicate settlement/withdraw |
| Deadline bypass | Call write at/after deadline while phase remains live | Each write has direct transaction-time bounds | -1/equal/+1 with stale phase and unchanged state on reject |
| Unaffected obstruction | An unchanged member refuses | Only derived affected unapproved non-proposer can refuse | Unaffected/wrong-member refusal rejected |
| Orphaned purse | Sponsor/member vanishes or review keeps failing | Anyone triggers direct expiry refund to fixed funder; credit never expires | Retry->expiry, no-consent->expiry, conservation/withdraw |
| Wrong EOA transfer boundary | Parent clears ledger but GEN remains | EVM interface + exact native balance delta and child receipt | Static interface check, direct transfer interception, bounded live transfer proof |
| Wallet account mismatch | Raw-string per-write override or stale provider | Configure real selected account in SDK client, no raw override, validate address | Real-SDK provider/RPC-intercepted value-bearing regression |

## Test plan

Test-first write implementation must demonstrate missing authorization/time/recovery/accounting behavior before filling production method bodies. Direct mode supplements immutable-source AST/payable metadata and explicit validator replay tests; it is not actual multi-validator consensus.

- Happy path: all baseline approvals; material B impact under A proposal; B consent; exact version adoption, 2 GEN credit and withdrawal.
- Preserve-only and proposer-only material change: valid complete review adopts once with fixed allocation.
- Wrong caller/state/entity/version/digest: public views/accounting unchanged; valid-byte wrong-provenance tripwire for baseline/proposal/assent/verdict.
- Bounds/isolation: IDs, zero/duplicate addresses, ASCII/term sizes, value 0/1/3 GEN, separate charters/proposals, locked membership.
- Model output: malformed/missing/contradictory/unavailable responses; extra/missing/duplicate IDs; invalid enums; changed-root/class mismatch; invalid objective/version/digest; prompt injection; semantic validator disagree and replay.
- Each time-bounded write: `boundary-1`, exact boundary, `boundary+1` with phase deliberately stale; every rejected path asserts unchanged canonical state and accounting.
- Every value/recovery method: wrong actor, forbidden/terminal state, duplicate, conservation, no double credit/withdraw/adopt; ambiguous -> retry -> expiry refund -> withdrawal.
- Withdrawal: negative ownership/zero credit, debit-before-emission, explicit EVM interface, payable metadata only on value receiver; live contract balance decreases exactly.
- Tooling: allowlisted raw/normalized receipt parser; independent SUCCESS vs terminal status; real SDK selected-account/value-bearing regression; user action wrappers/control/finality/reload and local-browser CORS.
- Runtime integration: matched gltest/GenVM setup; bounded target smoke before purse; then real Studio Dev full lifecycle with safe evidence only.

## Claim-to-code matrix

| Claim | Contract method/state | View/read | Test | Network evidence |
|---|---|---|---|---|
| Three members agree to exact baseline | create_charter/ratify DRAFT->ACTIVE | get_charter/get_actions | baseline origin/digest/isolation/time tripwires | Planned studio-dev/lifecycle.json baseline writes+finalized reads; PENDING |
| Neutral impact-derived consent | review plus normalized complete impacts | get_proposal/get_attempt | malicious roots/coverage/semantic replay | Planned consensus verdict safe allowlist/current proposal; PENDING |
| Affected members decide canonical revision | consent/reject; exact digest/base, ADOPTED/REJECTED | get_charter/get_proposal | wrong/unaffected/duplicate/stale/time/accounting | Planned finalized revision/assent/refusal reads; PENDING |
| Every purse has a destination | propose_amendment/expire/refusal/adoption credits | get_credit/get_accounting | all branches, conservation, retry/expiry negative | Planned 2 GEN lifecycle/refund zero-liability evidence; PENDING |
| Withdrawal actually transfers GEN | withdraw debit + EVM message | get_credit/get_accounting plus native balance | debit/zero/owner/interface/static metadata | Planned successful child receipt + exact native contract balance decrease; PENDING |
| Full honest browser product | Typed adapter and 8 routes/real selected EVM provider | Canonical reload after each successful finalization | 23 baseline frontend tests; real SDK and browser checks required | Planned browser signed lifecycle/local and production CORS; PENDING |
| Reusable primitive | Documented 9 writes/8 views; one state owner | Canonical version/consent interface | Interface/schema test and native adapter | Planned deployed schema + reusable adapter evidence; PENDING |

## Analogue and differentiation matrix

| Prior idea | Similar dimensions | Structural difference | Collision decision |
|---|---|---|---|
| BridgeDraft | Constitutive text and multiple wallet parties | Existing-version per-member impact, derived minority consent, canonical revision adoption, revision-authority integration instead of generated bilateral balanced draft and two credits | At least question/state/consequence/reuse differ; not a rename |
| SemanticPolicyQuorum | Policy meaning and authorized owner inputs | Protect affected minority's consent; peer affected/unaffected roles; old/new impact, selective assent/version state, revision authority rather than plan intersection/execution ticket | At least four substantive dimensions differ |
| GrantLattice | Constitutive qualitative permission/preservation | No delegation attenuation/revocation tree; material change permitted only with affected peer consent; current charter revision replacement | At least actor/question/state/consequence/reuse differ |
| CanonMerge | Parent text and changes | No fictional merge/fork or continuation rights; three initial ratifiers; impact-derived consent; no adoption without selective assent | At least actor/question/state/consequence/reuse differ |
| SemanticSetoff | Three ratifiers and exact constitutive bytes | No debt cycle/net positions/discharge; impact and revision/consent state; one fixed proposer purse rather than collateral redistribution | At least trust/question/state/consequence/reuse differ |
| Generic jury/clause/escrow | Semantic interpretation | Complete participant impact derives selective consent barrier before canonical version adoption, not a generic winner/applies label or one-step escrow release | Reject generic template; this protocol's version/consent consequence is load-bearing |

## Adoption path and milestone headroom

Possible consumers: a DAOhaus charter proposal UI, a Safe governance planning app, and a LangGraph multi-organization agent gateway using native GenLayer reads/writes. No endorsement, adoption or enforcement of external EVM transactions is claimed.

Next substantial increment: explicit cross-version impact composition/rebasing for competing amendments and a real gateway that checks adopted current revision before agent execution. V1 already permits sequential single-live amendments within its bounded history; the milestone must add new composition semantics and actual consumer enforcement, not relabel that existing behavior. Any later Safe/EVM enforcement needs its own authenticated cross-chain authority proof and live evidence.

## Deployment and evidence plan

Studio Dev identity binds endpoint/chain, source commit, exact current template/runner/API and one active deployed address. Three existing authorized EOAs provide role separation after safe config discovery; read balances and required fee caps first. No new wallet/funding without explicit applicable action-time authorization.

Resumable scripts store only allowlisted identity/transaction hashes/status/result/current IDs. Check existing source/address/schema and current transactions/views before resubmission. Archive superseded revisions with reason/attempt IDs/recovery status. A broken revision may be marked abandoned per policy; never conceal stranded GEN or send more value.

First run a zero-value deployment/schema/bounded smoke proving class recognition and actual runtime SUCCESS. Only then run 2 GEN proposal, real independent semantic review, required B consent, finalized canonical version and credit, EVM withdrawal with exact native contract-balance decrease. Separately run refusal and direct expiry refund recovery; all transaction values are 0 or 1–2 GEN. Canonical reads after finalization prove accounting conservation and final zero liability. Pending browser proof never becomes script proof by relabeling.

Evidence belongs only in `docs/evidence/studio-dev/`; local tests in `docs/evidence/local/`. Never save raw full receipts, traces, validator configuration, node_config or full stdout/stderr. Parser projects explicit safe fields and accepts raw and normalized shapes. No legacy Studionet/address evidence is reused.

## Definition of Done

- One reusable ASCII intelligent primitive, exact current versioned runner and one validator-visible project class recognized by semantic lint.
- All required direct adversarial/time/authentication/settlement/accounting/metadata tests and matched gltest verification pass.
- `npm run check` covers all contracts, direct tests, deployment/parser/real-SDK checks, frontend TypeScript/tests and production build.
- Full native Studio Dev finalized SUCCESS lifecycle, independent semantic verdict, canonical rights consequence, every 2 GEN purse credited/refunded/withdrawn, exact native transfer evidence.
- Every claimed browser step has wrapper, contextual control, test, actual finality handling, canonical reload and genuine browser-wallet proof; browser RPC works without CORS errors.
- Existing UI baseline preserved, English product/public docs, no fake canonical data or exposed private/system/reviewer material.
- Hygienic public repository, successful current-commit CI, verified Vercel HTTP/body/app, accurate README and copy-ready Projects packet.
- Read-only project precheck with Projects category has NO BLOCKER; exact current counts and explicit limitations; final full master/checklist audit and postmortem/registry update.

## Honest limitations and evidence status

Local Phase 3A/3B: TypeScript, 23 frontend tests and build pass; wallet-less browser form/modal/responsive/contrast checks pass. Target-runtime selection probe: two leader simulations SUCCESS, source fetch bounded/200; not independent-validator consensus. Actual deployment, network lifecycle, transfer, real SDK account compatibility, extension-browser wallet, production, CI and submission are PENDING. V1 bounds/constitutive-only authority above remain explicit even after completion. No legal advice or real-world enforcement is asserted.

## Kill criteria

Stop/reassess if a proposer/backend can choose affected members or payouts, any constitutive approval lacks origin/binding, a deterministic diff suffices for the core decision, four fingerprint dimensions collide, source/runtime availability fails structurally, a malformed leader can move rights/GEN, any write bypasses direct expiry, any purse lacks a recoverable destination, or transfer proof contradicts internal debit. Missing genuine browser/production/CI evidence blocks completion; it must never be replaced with mock/script/static proof.
