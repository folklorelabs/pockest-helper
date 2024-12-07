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
  const queueLabels = React.useMemo(() => pockestGetters.getQueueLabels(pockestState), [pockestState]);
  return (
    <div className="PockestLine">
      <span className="PockestText">Queued Next</span>
      <span className="PockestText PockestLine-value">
        <button
          className="QueueBtn PockestLink"
          disabled={!pockestState.autoQueue || (pockestState?.simpleMode && !!pockestState?.data?.monster?.live_time)}
          onClick={() => setShowLog && setShowLog(true)}
        >
          {queueLabels?.[0] || 'None'}
        </button>
      </span>
    </div>
  );
}

export default QueueNextLine;
