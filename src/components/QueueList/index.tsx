// import React from 'react';

import React from 'react';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import QueueItem from '../QueueItem';
import './index.css';
import parsePlanId from '../../utils/parsePlanId';

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
            const targetableMonsters = pockestGetters.getTargetableMonsters(pockestState, 6)
              .filter((m) => !pockestState.planQueue?.map((qm) => qm.monsterId).includes(m.monster_id))
              .sort((a, b) => {
                if (!a.unlock && b.unlock) return -1;
                if (a.unlock && !b.unlock) return 1;
                const aAffordable = affordableMonsterIds.includes(a.monster_id);
                const bAffordable = affordableMonsterIds.includes(b.monster_id);
                if (aAffordable && !bAffordable) return -1;
                if (!aAffordable && bAffordable) return 1;
                if ((a.eggIds?.[0] || 0) < (b.eggIds?.[0] || 0)) return -1;
                if ((a.eggIds?.[0] || 0) > (b.eggIds?.[0] || 0)) return 1;
                return (a.monster_id || 0) - (b.monster_id || 0);
              });
            const monsterToAdd = targetableMonsters[0];
            const planId = monsterToAdd?.planId || '1BRP6';
            const monsterToAddParsedPlanId = parsePlanId(planId);
            const statPlanId = monsterToAdd?.statPlan || monsterToAddParsedPlanId?.primaryStatLetter.repeat(6) || '';
            const planQueue = [
              ...(pockestState.planQueue || []),
              {
                id: window.crypto.randomUUID(),
                monsterId: monsterToAdd?.monster_id || -1,
                planAge: monsterToAdd?.unlock ? 6 : 5,
                planId: monsterToAdd?.planId || '1BRP6',
                statPlanId,
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
