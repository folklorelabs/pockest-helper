import AutoPlanControlsSimple from '../AutoPlanControlsSimple';
import PauseBtn from '../PauseBtn';
import QueueControls from '../QueueControls';
import SimplePlan from '../SimplePlan';
import AppMainTemplate from './AppMain';

function AppMain() {
  return (
    <AppMainTemplate
      className="AppMain--careSimple"
      content={
        <>
          <QueueControls />
          <hr />
          <AutoPlanControlsSimple />
          <hr />
          <SimplePlan rows={45} />
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
