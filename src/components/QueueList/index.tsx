import React from 'react';

import {
  usePockestContext,
  pockestGetters,
} from '../../contexts/PockestContext';
import './index.css';

function QueueList() {
  const {
    pockestState,
    // pockestDispatch,
  } = usePockestContext();
  const queueLabels = React.useMemo(() => pockestGetters.getQueueLabels(pockestState), [pockestState]);
  return (
    <div className="QueueList">
      {queueLabels}
    </div>
  );
}

export default QueueList;
