import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { AppProvider } from './contexts/AppProvider';
import { PockestProvider } from './contexts/PockestContext';
import log from './utils/log';
import './reset.css';
import './index.css';

const APP_ID = 'PockestHelperExtension';

const appContainer = document.querySelector('body');
let mainEl = document.getElementById(APP_ID);
if (mainEl && appContainer) {
  log('Existing Pockest Helper instance found. Removing the element.');
  appContainer.removeChild(mainEl);
}
mainEl = document.createElement('div');
mainEl.id = APP_ID;
if (appContainer) {
  appContainer.appendChild(mainEl);
}
ReactDOM.createRoot(mainEl).render(
  <React.StrictMode>
    <PockestProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </PockestProvider>
  </React.StrictMode>,
);
