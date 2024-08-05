import React from 'react';
import AppMainTemplate from './AppMain';

function AppMain() {
  return (
    <AppMainTemplate
      content={(
        <p className="App-updateText">
          Loading...
        </p>
      )}
    />
  );
}

export default AppMain;
