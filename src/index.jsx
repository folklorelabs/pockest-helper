import React from 'react';
import ReactDOM from 'react-dom/client';
import { PockestProvider } from './contexts/PockestContext';
import { AppProvider } from './contexts/AppContext';
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
      <AppProvider>
        <App />
      </AppProvider>
    </PockestProvider>
  </React.StrictMode>,
);

(async () => {
  const data = await chrome.runtime.sendMessage({ type: 'POST_DISCORD', content: 'another test' });
  console.log('res', { data });
})();
