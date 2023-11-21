import React from 'react';
import ReactDOM from 'react-dom/client';
import { PockestProvider } from './contexts/PockestContext';
import App from './components/App';
import './index.css';

const APP_ID = 'PockestHelperExtension';
let mainEl = document.getElementById(APP_ID);
mainEl = document.createElement('div');
mainEl.id = APP_ID;
document.querySelector('body').appendChild(mainEl);
ReactDOM.createRoot(mainEl).render(
  <React.StrictMode>
    <PockestProvider>
      <App />
    </PockestProvider>
  </React.StrictMode>
);
