import React from 'react';
import PauseBtn from '../PauseBtn';
import AppMainTemplate from './AppMain';
import SimplePlan from '../SimplePlan';
import AutoPlanControlsSimple from '../AutoPlanControlsSimple';

function AppMain() {
  return (
    <AppMainTemplate
      className="AppMain--careSimple"
      content={(
        <>
          <AutoPlanControlsSimple />
          <hr />
          <SimplePlan title="Preset Plan" rows={45} />
        </>
      )}
      footer={(
        <div className="App-button">
          <PauseBtn />
        </div>
      )}
    />
  );
}

export default AppMain;
