import AutoPlanControls from '../AutoPlanControls';
import CleanControls from '../CleanControls';
import FeedControls from '../FeedControls';
import MatchControls from '../MatchControls';
import TrainControls from '../TrainControls';
import CureControls from '../CureControls';
import PauseBtn from '../PauseBtn';
import AppMainTemplate from './AppMain';
import StatusTimers from '../StatusTimers';
// import QueueControls from '../QueueControls';

function AppMain() {
  return (
    <AppMainTemplate
      className="AppMain--care"
      content={(
        <>

          {/* // TODO: re-enable autoQueue
          <QueueControls />
          <hr /> */}
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
