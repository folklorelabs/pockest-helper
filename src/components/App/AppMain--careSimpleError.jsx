import React from 'react';
import AppMainTemplate from './AppMain';

function AppMain() {
  return (
    <AppMainTemplate
      content={(
        <div className="App-errorBox">
          <h1 className="App-updateTitle">Unknown Monster</h1>
          <p className="App-updateTextSecondary">
            Pockest Helper has detected a monster that it did not hatch.
            It is advised that you let Pockest Helper handle all actions
            because evolution care plans can be complex.
            Please return when this monster has died/departed.
          </p>
          <p className="App-updateTextSecondary">
            Alternatively you can switch to &quot;Advanced&quot;
            mode if you have a good understanding of the mechanics.
          </p>
        </div>
      )}
    />
  );
}

export default AppMain;
