import PauseBtn from '../PauseBtn';
import AppMainTemplate from './AppMain';
import SimplePlan from '../SimplePlan';
import AutoPlanControlsSimple from '../AutoPlanControlsSimple';
import QueueControls from '../QueueControls';

function AppMain() {
  return (
    <AppMainTemplate
      className="AppMain--careSimple"
      content={(
        <>
          <QueueControls />
          <hr />
          <AutoPlanControlsSimple />
          <hr />
          <SimplePlan rows={45} />
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
