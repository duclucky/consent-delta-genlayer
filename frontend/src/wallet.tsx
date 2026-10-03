import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { LogOut, Wallet, X } from 'lucide-react';
import { validAddress, type Address } from './adapter';

export interface Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
  providers?: Provider[]; isMetaMask?: boolean; isRabby?: boolean; isCoinbaseWallet?: boolean; isBraveWallet?: boolean;
}
export type DetectedWallet = { id: string; name: string; provider: Provider };
declare global { interface Window { ethereum?: Provider; okxwallet?: Provider; rabby?: Provider; coinbaseWalletExtension?: Provider; braveEthereum?: Provider } }
export function injectedWallets(): DetectedWallet[] {
  const entries: [string, Provider | undefined][] = [['OKX', window.okxwallet], ['Rabby', window.rabby], ['Coinbase', window.coinbaseWalletExtension], ['Brave', window.braveEthereum]];
  for (const p of window.ethereum?.providers ?? (window.ethereum ? [window.ethereum] : [])) entries.push([p.isRabby ? 'Rabby' : p.isCoinbaseWallet ? 'Coinbase' : p.isBraveWallet ? 'Brave' : p.isMetaMask ? 'MetaMask' : 'Injected EVM wallet', p]);
  return entries.filter(([, p], i, a) => p && a.findIndex(([, other]) => p === other) === i).map(([name, provider], i) => ({ id: `injected-${i}`, name, provider: provider! }));
}
type WalletState = { address?: Address; provider?: Provider; name?: string; wallets: DetectedWallet[]; open: () => void; disconnect: () => void };
const Context = createContext<WalletState | null>(null);
export const useWallet = () => { const x = useContext(Context); if (!x) throw new Error('Wallet context is unavailable'); return x; };

export function WalletContext({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [selection, setSelection] = useState<{ address: Address; provider: Provider; name: string }>();
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    setWallets(injectedWallets());
    const announced = (event: Event) => {
      const detail = (event as CustomEvent<{ info: { uuid: string; name: string }; provider: Provider }>).detail;
      if (!detail?.info?.uuid || typeof detail.info.name !== 'string' || !detail.provider?.request) return;
      setWallets(old => [...old.filter(x => x.provider !== detail.provider), { id: detail.info.uuid, name: detail.info.name.slice(0,80), provider: detail.provider }]);
    };
    window.addEventListener('eip6963:announceProvider', announced);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    return () => window.removeEventListener('eip6963:announceProvider', announced);
  }, []);
  useEffect(() => {
    if (shown) dialog.current?.showModal(); else dialog.current?.close();
  }, [shown]);
  useEffect(() => {
    if (!selection) return;
    const accounts = (...args: unknown[]) => { const next = args[0]; if (!Array.isArray(next) || !validAddress(String(next[0]))) setSelection(undefined); else setSelection(x => x ? { ...x, address: next[0] as Address } : undefined); };
    const disconnected = () => setSelection(undefined);
    selection.provider.on?.('accountsChanged', accounts);
    selection.provider.on?.('disconnect', disconnected);
    return () => { selection.provider.removeListener?.('accountsChanged', accounts); selection.provider.removeListener?.('disconnect', disconnected); };
  }, [selection?.provider]);
  const connect = async (wallet: DetectedWallet) => {
    setBusy(true); setError('');
    try { const response = await wallet.provider.request({ method: 'eth_requestAccounts' }); if (!Array.isArray(response) || !validAddress(String(response[0]))) throw new Error('This wallet did not return a valid account.'); setSelection({ address: response[0] as Address, provider: wallet.provider, name: wallet.name }); setShown(false); }
    catch { setError('The wallet connection was not approved. Unlock your wallet, then choose it again.'); }
    finally { setBusy(false); }
  };
  return <Context.Provider value={{ ...selection, wallets, open: () => { setError(''); setShown(true); }, disconnect: () => setSelection(undefined) }}>
    {children}
    <dialog ref={dialog} onCancel={() => setShown(false)} onClose={() => setShown(false)} aria-labelledby="wallet-title">
      <div className="dialog-top"><div><p className="eyebrow">Your choice</p><h2 id="wallet-title">Connect a wallet</h2></div><button className="icon-button" aria-label="Close wallet selection" onClick={() => setShown(false)}><X aria-hidden="true" /></button></div>
      <p>Select the wallet you want to use. Connection does not send a transaction.</p>
      {wallets.length ? <div className="wallet-list">{wallets.map(w => <button disabled={busy} key={w.id} onClick={() => void connect(w)}><Wallet aria-hidden="true" />{w.name}<span>Connect</span></button>)}</div> : <div className="notice">No compatible EVM wallet was detected. Open this app in a browser with your preferred wallet extension, then reload.</div>}
      {busy && <p role="status">Waiting for your wallet…</p>}{error && <p role="alert" className="error">{error}</p>}
    </dialog>
  </Context.Provider>;
}
export function WalletButton() {
  const w = useWallet(); const [menu, setMenu] = useState(false);
  return w.address ? <div className="wallet-menu"><button className="secondary" aria-expanded={menu} aria-controls="account-menu" onClick={() => setMenu(!menu)}><Wallet size={18} aria-hidden="true" />{w.address.slice(0,6)}…{w.address.slice(-4)}</button>{menu && <div id="account-menu" className="menu"><span>{w.name}</span><span className="address">{w.address}</span><button onClick={() => { w.disconnect(); setMenu(false); }}><LogOut size={18} aria-hidden="true" />Disconnect</button></div>}</div> : <button className="secondary" onClick={w.open}><Wallet size={18} aria-hidden="true" />Connect wallet</button>;
}
