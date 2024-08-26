import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import './index.css';

function AppUpdateAlert() {
  const {
    remoteVersion,
    isOutdated,
  } = useAppContext();
  if (!isOutdated) return '';
  return (
    <p className="AppUpdateAlert">
      <a href={`https://github.com/folklorelabs/pockest-helper/releases/${remoteVersion}`} target="_blank" rel="noreferrer">
        New version available (
        {remoteVersion}
        )
      </a>
    </p>
  );
}

export default AppUpdateAlert;
