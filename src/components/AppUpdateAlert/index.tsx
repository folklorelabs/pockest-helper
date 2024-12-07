import React from 'react';
import { AppContext } from '../../contexts/AppContext';
import './index.css';

function AppUpdateAlert() {
  const {
    remoteVersion,
    isOutdated,
  } = React.useContext(AppContext);
  if (!isOutdated) return '';
  return (
    <p className="AppUpdateAlert">
      <a href={`https://github.com/folklorelabs/pockest-helper/releases/${remoteVersion}`} target="_blank" rel="noreferrer">
        New version available (v
        {import.meta.env.VITE_APP_VERSION}
        {' '}
        →
        {' '}
        {remoteVersion}
        )
      </a>
    </p>
  );
}

export default AppUpdateAlert;
