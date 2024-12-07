import PauseBtn from '../PauseBtn';
import AppMainTemplate from './AppMain';
import SimplePlan from '../SimplePlan';
import AutoPlanControlsSimple from '../AutoPlanControlsSimple';
import QueueControls from '../QueueControls';
import { usePockestContext } from '../../contexts/PockestContext';

function AppMain() {
  const {
    pockestState,
  } = usePockestContext();
  return (
    <AppMainTemplate
      className="AppMain--careSimple"
      content={(
        <>
          {pockestState?.autoQueue ? (
            <QueueControls />
          ) : (
            <AutoPlanControlsSimple />
          )}
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
