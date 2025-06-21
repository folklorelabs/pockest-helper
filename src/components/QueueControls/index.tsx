import React from 'react';
import {
  usePockestContext,
  pockestActions,
} from '../../contexts/PockestContext';
import { AppContext } from '../../contexts/AppContext';
import './index.css';

function QueueControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const { setShowLog } = React.useContext(AppContext);
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
      <div className="LogCountLine PockestLine">
        <span className="PockestText">
          Presets Queued
        </span>
        <button
          type="button"
          className="PockestText PockestLine-value PockestLink"
          onClick={() => setShowLog && setShowLog(true)}
        >
          {pockestState.planQueue.length ?? '--'}
        </button>
      </div>
    </div>
  );
}

export default QueueControls;
