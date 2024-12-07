import React from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '../../contexts/AppContext';
import AppMainTemplate from './AppMain';

function AppMain({ msg }: { msg: string }) {
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

AppMain.defaultProps = {
  msg: 'An unexpected error occurred.',
};

AppMain.propTypes = {
  msg: PropTypes.string,
};

export default AppMain;
