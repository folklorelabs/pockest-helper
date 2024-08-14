import React from 'react';
import ReactDOM from 'react-dom/client';
import { PockestProvider } from './contexts/PockestContext';
import { AppProvider } from './contexts/AppContext';
import App from './components/App';
import log from './utils/log';
import * as ENV from './config/env';
import './reset.css';
import './index.css';

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
  1: ENV.APP_VERSION,
  2: ENV.DISCORD_MATCH_WEBHOOK?.split('/').pop(),
  3: ENV.DISCORD_EVO_WEBHOOK?.split('/').pop(),
});
