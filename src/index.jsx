import React from 'react';
import ReactDOM from 'react-dom/client';
import { PockestProvider } from './contexts/PockestContext';
import { AppProvider } from './contexts/AppContext';
import App from './components/App';
import log from './utils/log';
import './reset.css';
import './index.css';
import { testDiscordEvoManual } from './utils/testDiscord';

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

(async () => {
  await testDiscordEvoManual();
})();
