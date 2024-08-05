import React from 'react';
import AppMainTemplate from './AppMain';

function AppMain() {
  return (
    <AppMainTemplate
      content={(
        <p className="App-updateText">
          Uh oh! Your session appears to be invalid.
          Did you open Pockest Helper in another tab?
        </p>
      )}
    />
  );
}

export default AppMain;
