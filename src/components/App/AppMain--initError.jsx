import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import AppMainTemplate from './AppMain';

function AppMain() {
  const {
    setShowLog,
  } = useAppContext();
  return (
    <AppMainTemplate
      content={(
        <p className="App-updateText">
          Uh oh, Pockest Helper was unable to initialize due to an error!
          <br />
          <br />
          Please see the
          {' '}
          <button
            className="PockestLink"
            type="button"
            onClick={() => setShowLog(true)}
          >
            Care Log
          </button>
          {' '}
          for more details.
        </p>
      )}
    />
  );
}

export default AppMain;
