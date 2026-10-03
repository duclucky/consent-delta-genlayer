import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { WalletContext } from './wallet';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><WalletContext><App /></WalletContext></BrowserRouter></React.StrictMode>);
