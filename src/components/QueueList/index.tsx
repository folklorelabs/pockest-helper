// import React from 'react';

import React from 'react';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import QueueItemControls from '../QueueItemControls';
import './index.css';

function QueueList() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const affordableMonsterIds = React.useMemo(() => pockestGetters.getAffordableMonsters(pockestState).map((m) => m.monster_id), [pockestState]);
  return (
    <div className="QueueList">
      <div className="QueueList-main">
        {pockestState?.planQueue?.length ? pockestState?.planQueue?.map((planQueueItem, index) => (
          <QueueItemControls key={`${pockestGetters.getPlanQueueItemLabel(pockestState, planQueueItem)}`} queueIndex={index} />
        )) : 'Nothing queued'}
      </div>
      <div
        className="QueueList-buttons"
      >
        <button
          type="button"
          className="PockestLink QueueList-add"
          aria-label={`Add Plan Queue`}
          onClick={() => {
            if (!pockestDispatch) return;
            const planAge = 5;
            const targetableMonsters = pockestGetters.getTargetableMonsters(pockestState, planAge)
              .filter((m) => affordableMonsterIds.includes(m.monster_id))
              .filter((m) => !pockestState.planQueue?.map((qm) => qm.monsterId).includes(m.monster_id));
            const planQueue = [
              ...(pockestState.planQueue || []),
              {
                planAge,
                monsterId: targetableMonsters[0]?.monster_id || -1,
                planId: '',
                statPlanId: '',
              },
            ];
            pockestDispatch(pockestActions.pockestSettings({ planQueue }));
          }}
        >
          ➕ Add
        </button>
      </div>
    </div >
  );
}

export default QueueList;
