import React from 'react';
import { usePockestContext } from '../../contexts/PockestContext';
import './index.css';
import { useAppContext } from '../../contexts/AppContext';

function AppErrorAlert() {
  const {
    pockestState,
  } = usePockestContext();
  const {
    setShowLog,
  } = useAppContext();
  if (!pockestState?.error) return '';
  return (
    <button
      className="AppErrorAlert"
      type="button"
      onClick={() => setShowLog(true)}
    >
      <p className="AppErrorAlert-message">
        {pockestState?.error?.includes('403') && pockestState?.error?.includes('buckler') ? '403 Auth Error: Please ensure you are logged in' : pockestState?.error}
      </p>
    </button>
  );
}

export default AppErrorAlert;
