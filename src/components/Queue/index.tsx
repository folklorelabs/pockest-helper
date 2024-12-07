import React from 'react';
import {
  usePockestContext,
  pockestGetters,
} from '../../contexts/PockestContext';
import './index.css';

function Queue() {
  const {
    pockestState,
    // pockestDispatch,
  } = usePockestContext();
  const queueLabels = React.useMemo(() => pockestGetters.getQueueLabels(pockestState), [pockestState]);
  return (
    <div className="Queue">
      <button className="QueueBtn PockestLink">
        {queueLabels?.[0] || 'None'}
      </button>
    </div>
  );
}

export default Queue;
