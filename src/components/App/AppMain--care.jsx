import React from 'react';
import AutoPlanControls from '../AutoPlanControls';
import CleanControls from '../CleanControls';
import FeedControls from '../FeedControls';
import MatchControls from '../MatchControls';
import TrainControls from '../TrainControls';
import CureControls from '../CureControls';
import PauseBtn from '../PauseBtn';
import AppMainTemplate from './AppMain';
import StatusTimers from '../StatusTimers';

function AppMain() {
  return (
    <AppMainTemplate
      className="AppMain--care"
      content={(
        <>
          <AutoPlanControls />
          <StatusTimers />
          <hr />
          <CleanControls />
          <hr />
          <FeedControls />
          <hr />
          <TrainControls />
          <hr />
          <MatchControls />
          <hr />
          <CureControls />
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
