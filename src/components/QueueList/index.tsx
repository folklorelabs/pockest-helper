// import React from 'react';

import React from 'react';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import QueueItem from '../QueueItem';
import './index.css';

function QueueList() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  React.useEffect(() => {
    // TODO: delete me after rc version. this is a fix for shill since he used before id was added.
    const fixRequired = !!pockestState?.planQueue?.find((planQueueItem) => !planQueueItem.id);
    if (!fixRequired) return;
    const fixedPlanQueue = pockestState?.planQueue?.map((planQueueItem) => ({
      ...planQueueItem,
      id: planQueueItem.id || window.crypto.randomUUID(),
    }), []);
    pockestDispatch?.(pockestActions.pockestSettings({ planQueue: fixedPlanQueue }));
  }, [pockestDispatch, pockestState?.planQueue]);
  const affordableMonsterIds = React.useMemo(() => pockestGetters.getAffordableMonsters(pockestState).map((m) => m.monster_id), [pockestState]);
  return (
    <div className="QueueList">
      <div className="QueueList-main">
        {pockestState?.planQueue?.length ? pockestState?.planQueue?.map((planQueueItem, index) => (
          <QueueItem key={`${pockestGetters.getPlanQueueItemLabel(pockestState, planQueueItem)}`} queueIndex={index} />
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
                id: window.crypto.randomUUID(),
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
