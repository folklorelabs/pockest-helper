import React from 'react';
import AutoPlanControls from '../AutoPlanControls';
import CleanControls from '../CleanControls';
import FeedControls from '../FeedControls';
import MatchControls from '../MatchControls';
import TrainControls from '../TrainControls';
import CureControls from '../CureControls';

function AppMainContent() {
  return (
    <>
      <AutoPlanControls />
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
  );
}

export default AppMainContent;
