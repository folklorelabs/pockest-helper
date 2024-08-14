import React from 'react';
import ReactDOM from 'react-dom/client';
import { PockestProvider } from './contexts/PockestContext';
import { AppProvider } from './contexts/AppContext';
import App from './components/App';
import './reset.css';
import './index.css';
import log from './utils/log';

const APP_ID = 'PockestHelperExtension';

const appContainer = document.querySelector('body');
let mainEl = document.getElementById(APP_ID);
if (mainEl) {
  log('Existing Pockest Helper instance found. Removing the element.');
  appContainer.removeChild(mainEl);
}
mainEl = document.createElement('div');
mainEl.id = APP_ID;
appContainer.appendChild(mainEl);
ReactDOM.createRoot(mainEl).render(
  <React.StrictMode>
    <PockestProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </PockestProvider>
  </React.StrictMode>,
);

console.log({
  1: import.meta.env.APP_VERSION,
  2: import.meta.env.DISCORD_MATCH_WEBHOOK?.split('/').pop(),
  3: import.meta.env.DISCORD_EVO_WEBHOOK?.split('/').pop(),
});
