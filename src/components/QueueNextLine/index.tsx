import React from 'react';
import {
  usePockestContext,
  pockestGetters,
} from '../../contexts/PockestContext';
import { AppContext } from '../../contexts/AppContext';
import './index.css';

function QueueNextLine() {
  const {
    setShowLog,
  } = React.useContext(AppContext);
  const {
    pockestState,
    // pockestDispatch,
  } = usePockestContext();
  const queueItemLabel = React.useMemo(() => pockestGetters.getPlanQueueItemLabel(pockestState, pockestState?.planQueue?.[0]), [pockestState]);
  return (
    <div className="PockestLine">
      <span className="PockestText">Queued Next</span>
      <span className="PockestText PockestLine-value">
        <button
          className="QueueBtn PockestLink"
          disabled={!pockestState.autoQueue || (pockestState?.simpleMode && !!pockestState?.data?.monster?.live_time)}
          onClick={() => setShowLog && setShowLog(true)}
        >
          {queueItemLabel || 'None'}
        </button>
      </span>
    </div>
  );
}

export default QueueNextLine;
