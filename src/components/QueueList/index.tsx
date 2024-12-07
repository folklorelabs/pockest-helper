import React from 'react';

import {
  usePockestContext,
  pockestGetters,
  pockestActions,
} from '../../contexts/PockestContext';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';
import './index.css';

function QueueList() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const [planQueue, setPlanQueue] = React.useState<PlanQueueItem[]>(pockestState.planQueue);
  return (
    <div className="QueueList">
      <div className="QueueList-main">
        {planQueue?.length ? planQueue?.map((item) => (
          <p>{pockestGetters.getPlanQueueItemLabel(pockestState, item)}</p>
        )) : 'Nothing queued'}
      </div>
      <div
        className="QueueList-buttons"
      >
        <button
          type="button"
          className="PockestLink QueueList-save"
          aria-label={`Save Plan Queue`}
          onClick={() => pockestDispatch && pockestDispatch(pockestActions.pockestSettings({ planQueue }))}
        >
          💾 Save
        </button>
        <button
          type="button"
          className="PockestLink QueueList-reset"
          aria-label={`Reset Plan Queue`}
          onClick={() => setPlanQueue(pockestState.planQueue)}
        >
          ❌ Reset
        </button>
      </div>
    </div>
  );
}

export default QueueList;
