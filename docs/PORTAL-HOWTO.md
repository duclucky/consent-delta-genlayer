# Portal how-to: exact product path

These nine separate headings/instructions match the prepared authenticated Projects form. Reproduction instructions are distinct from observed execution: the recorded primary wallet used Chrome/OKX; the owner-authorized peer actions used API.

## 1. Open the app and connect your wallet

Open https://consent-delta-genlayer.vercel.app. Click Connect wallet and choose a detected extension in the centered picker. Approve the connection and Studio Dev network request in your wallet. Confirm the displayed address. To create a new demo, use three distinct authorized wallets; the proposer needs 2 GEN plus the quoted network fees.

## 2. Create a shared charter

Click Create a charter (or Charters → New charter). Your connected wallet becomes member A. Enter a title, the distinct B/C wallet addresses, and complete permissions, prohibitions and duties for all three members. Choose the approval deadline. Click Review initial terms, check every address and term, then Sign and create charter. Wait for finalized success and the charter detail page. Creating a charter locks 0 GEN.

## 3. Approve the exact initial terms

On the charter page, A reads all three members’ terms and clicks Approve initial terms, then confirms the wallet request. Send the same charter link to B/C; each authorized member approves the same exact baseline using its own wallet/client. Wait for all three approvals and the Current/version 1 state. In the recorded run, A signed through Chrome/OKX and B/C approved through owner-authorized API calls.

## 4. Propose an amendment and lock 2 GEN

From the active charter, click Propose an amendment. Fill all three replacement terms: for the example, preserve A/C exactly and add a payment duty to B. Choose a review/consent deadline and click Review proposed terms. Check the old and proposed terms, the fixed 2 GEN purse and separate quoted protocol fee. Click Sign and lock 2 GEN, confirm in your wallet, and wait for finalized success. The current charter must remain version 1 while review is pending.

## 5. Request the independent impact review

Open the amendment and click Request impact review. Confirm the real quoted fee in your wallet; this action adds no application purse. Wait for accepted/decided and finalized success. Read each member’s Current terms, Proposed terms and impact label. For the recorded example, A/C are preserved and B is materially changed, so only B is listed under Consent needed.

## 6. Obtain the affected member’s exact consent

The required B member reviews the same amendment and approves its exact proposed terms using its authorized wallet/client. The UI action is Approve these exact terms when connected as B; unaffected wallets do not receive that action. In the recorded run B approved through API. After finalized success, confirm Adopted, B marked Approved, and the charter at Current version 2 with the new terms. The proposer’s credit becomes 2 GEN.

## 7. Withdraw the proposer’s credit

With the proposing wallet connected, open Account or Check your credits. Confirm the actual available credit is 2 GEN, click Withdraw credit and inspect the wallet request. Confirm, wait for finalized success, then check that the account reloads to No available credits. Verify the withdrawal’s native child in Explorer: active contract as sender, proposing wallet as recipient and exactly 2 GEN transferred; contract native balance decreases by 2 GEN.

## 8. Handle failure, refusal or expiry

If a submitted action fails or times out, keep its transaction hash and check finality/current state before retrying; do not replay a finalized success. A required member may choose Decline the amendment; after finalized refusal the prior charter version remains and the funder receives a 2 GEN refund credit. After the actual deadline, Recover expired purse opens that funder’s refund. Withdraw the credit separately. Review retry appears only for a live retryable review. Refusal/expiry have script and test proof; their browser signatures are not claimed.

## 9. Inspect the completed example and evidence

Open https://consent-delta-genlayer.vercel.app/charters/CD-9f43fd7e-9f7. Under Amendment history, open AM-9805f7e0-969 and verify A/C preserved, B approved, Adopted and current charter version 2. Open the repository’s docs/evidence/studio-dev/BROWSER-LIFECYCLE.md for five Chrome/OKX writes, three separately labeled API peer writes and the finalized native withdrawal. The first failed withdrawal is retained and excluded from successful counts. Run npm run check, node scripts/verify-lifecycle.mjs and node scripts/verify-browser-lifecycle.mjs for fresh verification.
