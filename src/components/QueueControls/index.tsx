import {
  usePockestContext,
  pockestActions,
} from '../../contexts/PockestContext';
import Queue from '../Queue';
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
            disabled={!paused}
          />
          <span className="PockestCheck-text">Queue</span>
        </label>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Queued Next</span>
        <span className="PockestText PockestLine-value">
          <Queue />
        </span>
      </div>
    </div>
  );
}

export default QueueControls;
