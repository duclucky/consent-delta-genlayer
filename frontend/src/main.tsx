import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { WalletContext, useWallet } from './wallet';
import { createStudioAdapter } from './studio-adapter';
import './styles.css';

function ConnectedApp() {
  const wallet = useWallet();
  const adapter = React.useMemo(() => createStudioAdapter({ contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
    account: wallet.address, provider: wallet.provider }), [wallet.address, wallet.provider]);
  return <App adapter={adapter} />;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><WalletContext><ConnectedApp /></WalletContext></BrowserRouter></React.StrictMode>);
