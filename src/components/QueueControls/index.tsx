import {
  usePockestContext,
  pockestActions,
} from '../../contexts/PockestContext';
import QueueNextLine from '../QueueNextLine';
import './index.css';

function QueueControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    autoQueue,
    paused,
  } = pockestState;
  return (
    <div className="QueueControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoQueue">
          <input
            id="PockestHelper_AutoQueue"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch && pockestDispatch(pockestActions.pockestPlanSettings({
              autoQueue: e.target.checked,
            }))}
            checked={autoQueue}
            disabled={!paused || (pockestState?.simpleMode && !!pockestState?.data?.monster?.live_time)}
          />
          <span className="PockestCheck-text">Queue</span>
        </label>
      </div>
      <QueueNextLine label="Current" queueIndex={0} />
      <QueueNextLine label="Next" queueIndex={1} />
    </div>
  );
}

export default QueueControls;
