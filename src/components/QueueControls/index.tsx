import React from 'react';
import { AppContext } from '../../contexts/AppContext';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';

function QueueControls() {
  const uniqueId = React.useId();
  const { pockestState, pockestDispatch } = usePockestContext();
  const { setShowLog } = React.useContext(AppContext);
  const {
    autoQueue,
    // paused,
  } = pockestState;
  const nextTargetItem = React.useMemo(() => {
    const nextItem = pockestState?.presetQueueId
      ? pockestState?.presetQueue?.[1]
      : pockestState?.presetQueue?.[0];
    return nextItem;
  }, [
    pockestState,
  ]);
  return (
    <div className="QueueControls">
      <div className="PockestLine">
        <label
          className="PockestCheck"
          htmlFor={`PockestHelper_AutoQueue${uniqueId}`}
          title={!pockestState?.presetQueue.length ? 'Your queue is empty. Please add a monster to your queue to enable the option.' : undefined}
        >
          <input
            id={`PockestHelper_AutoQueue${uniqueId}`}
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => {
              pockestDispatch?.(
                pockestActions.pockestPlanSettings({
                  autoQueue: e.target.checked,
                }),
              )
            }}
            checked={autoQueue}
            disabled={!pockestState?.presetQueue.length}
          />
          <span className="PockestCheck-text">Queue</span>
        </label>
      </div>
      <div className="LogCountLine PockestLine">
        <span className="PockestText">Next</span>
        <button
          type="button"
          className="PockestText PockestLine-value PockestLink"
          onClick={() => setShowLog?.(true)}
          title="See and modify your queue"
        >
          {pockestGetters.getPresetQueueItemLabel(pockestState, nextTargetItem) || '--'}
        </button>
      </div>
      <div className="LogCountLine PockestLine">
        <span className="PockestText">Total Queued</span>
        <button
          type="button"
          className="PockestText PockestLine-value PockestLink"
          onClick={() => setShowLog?.(true)}
          title="See and modify your queue"
        >
          {pockestState?.presetQueue?.length ?? '--'}
        </button>
      </div>
    </div>
  );
}

export default QueueControls;
