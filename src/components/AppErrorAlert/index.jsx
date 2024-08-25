import React from 'react';
import { usePockestContext } from '../../contexts/PockestContext';
import './index.css';

function AppErrorAlert() {
  const {
    pockestState,
  } = usePockestContext();
  if (!pockestState?.error) return '';
  return (
    <div className="AppErrorAlert">
      <p className="AppErrorAlert-message">
        {pockestState?.error?.includes('403') && pockestState?.error?.includes('buckler') ? '403 Auth Error: Please ensure you are logged in' : pockestState?.error}
      </p>
    </div>
  );
}

export default AppErrorAlert;
