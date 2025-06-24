import React from 'react';
import {
  usePockestContext,
  pockestActions,
  pockestGetters,
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
    // paused,
  } = pockestState;
  const nextTargetItem = React.useMemo(() => {
    const nextItem = pockestState?.presetQueueId ? pockestState?.presetQueue?.[1] : pockestState?.presetQueue?.[0];
    return nextItem;
  }, [pockestState]);
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
            // disabled={!paused}
          />
          <span className="PockestCheck-text">Queue</span>
        </label>
      </div>
      <div className="LogCountLine PockestLine">
        <span className="PockestText">
          Next
        </span>
        <button
          type="button"
          className="PockestText PockestLine-value PockestLink"
          onClick={() => setShowLog && setShowLog(true)}
        >
          {pockestGetters.getPresetQueueItemLabel(pockestState, nextTargetItem)}
        </button>
      </div>
      <div className="LogCountLine PockestLine">
        <span className="PockestText">
          Total Queued
        </span>
        <button
          type="button"
          className="PockestText PockestLine-value PockestLink"
          onClick={() => setShowLog && setShowLog(true)}
        >
          {pockestState?.presetQueue?.length ?? '--'}
        </button>
      </div>
    </div>
  );
}

export default QueueControls;
