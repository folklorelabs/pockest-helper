import AutoPlanControls from '../AutoPlanControls';
import CleanControls from '../CleanControls';
import CureControls from '../CureControls';
import FeedControls from '../FeedControls';
import MatchControls from '../MatchControls';
import PauseBtn from '../PauseBtn';
import QueueControls from '../QueueControls';
import StatusTimers from '../StatusTimers';
import TrainControls from '../TrainControls';
import AppMainTemplate from './AppMain';

function AppMain() {
  return (
    <AppMainTemplate
      className="AppMain--care"
      content={
        <>
          <QueueControls />
          <hr />
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
      }
      footer={
        <div className="App-button">
          <PauseBtn />
        </div>
      }
    />
  );
}

export default AppMain;
