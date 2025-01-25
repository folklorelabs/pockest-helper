import React from 'react';
import { AppContext } from '../../contexts/AppContext';
import AppMainTemplate from './AppMain';

function AppMain({ msg = 'An unexpected error occurred.' }: { msg?: string }) {
  const {
    setShowLog,
  } = React.useContext(AppContext);
  return (
    <AppMainTemplate
      content={(
        <>
          <h1 className="App-updateTitle App-updateTitle--error">Uh oh!</h1>
          <p className="App-updateText App-updateText--error">
            {msg}
          </p>
          <p className="App-updateTextSecondary">
            See the
            {' '}
            <button
              className="PockestLink"
              type="button"
              onClick={() => {
                if (typeof setShowLog === 'function') setShowLog(true)
              }}
            >
              Care Log
            </button>
            {' '}
            for more details on this error.
          </p>
        </>
      )}
    />
  );
}

export default AppMain;
