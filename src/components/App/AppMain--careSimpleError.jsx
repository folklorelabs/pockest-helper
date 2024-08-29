import React from 'react';
import AppMainTemplate from './AppMain';

function AppMain() {
  return (
    <AppMainTemplate
      content={(
        <div className="App-errorBox">
          <h1 className="App-updateTitle">Monster Exists</h1>
          <p className="App-updateTextSecondary">
            Pockest Helper has detected a monster that it did not hatch.
            &quot;Simple&quot; mode requires the monster to be hatched by the helper
            and advises all actions to be made by the helper
            because evolution care plans can be complex.
            Please return when the existing monster has died/departed.
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
