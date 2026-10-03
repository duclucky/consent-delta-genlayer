# ConsentDelta

Change a shared charter with the consent of the people whose rights change.

ConsentDelta is a GenLayer Projects application for three wallet-authenticated members. Validators compare the meaning of an exact amendment with the current co-ratified charter. Contract code derives which members must consent before the new version becomes canonical.

Status: deployed on Studio Dev. The script-signed lifecycle verified adoption, refusal, expiry and three 2 GEN withdrawals, with zero remaining contract balance. Extension-wallet browser transactions, production hosting and CI are still pending. No external adoption, legal enforceability or cross-chain enforcement is claimed.

The proposing member locks exactly **2 GEN** for an amendment. Adoption opens that member's fixed implementation credit; rejection or expiry refunds it. Semantic output never supplies recipients or payout amounts.

See [specification](docs/README.md) for the trust boundary, workflow and limitations.

## Deployed Contract

Studio Dev: `0x18F1689CE9241894433F44b41989C46E45a13DC5`.

[Contract explorer](https://explorer-studio-dev.genlayer.com/address/0x18F1689CE9241894433F44b41989C46E45a13DC5) · [Finalized lifecycle and native transfers](docs/evidence/studio-dev/LIFECYCLE.md).

## Verification

Use Node.js 24 and Python 3.12. Create `.venv`, install `requirements.txt`, run `npm ci`, then `npm run check`. The check validates the single contract, 103 direct tests, 24 tooling tests, 37 frontend tests, TypeScript and the production build. It requires no wallet keys or network writes.

## Run the frontend

Copy `frontend/.env.example` to the ignored `frontend/.env` and set `VITE_CONTRACT_ADDRESS` to the deployed address above. Run `npm run dev` and open `http://127.0.0.1:5177`. The app reads canonical Studio Dev state through a same-origin proxy. Connect an installed EVM wallet from the wallet selection modal before writing.
