import React from 'react';
import {
  usePockestContext,
  pockestGetters,
} from '../../contexts/PockestContext';
import { AppContext } from '../../contexts/AppContext';
import './index.css';

interface QueueNextLineProps {
  label?: string;
  queueIndex?: number;
}
function QueueNextLine({ label = 'Next', queueIndex = 0 }: QueueNextLineProps) {
  const {
    setShowLog,
  } = React.useContext(AppContext);
  const {
    pockestState,
    // pockestDispatch,
  } = usePockestContext();
  const queueItemLabel = React.useMemo(() => pockestGetters.getPlanQueueItemLabel(pockestState, pockestState?.planQueue?.[queueIndex]), [pockestState, queueIndex]);
  return (
    <div className="PockestLine">
      <span className="PockestText">{label}</span>
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
