// import React from 'react';

import React from 'react';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import QueueItem from '../QueueItem';
import parsePlanId from '../../utils/parsePlanId';
import SortableList from '../SortableList';
import './index.css';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';
import PlanQueueFailBehavior from '../../contexts/PockestContext/types/PlanQueueFailBehavior';
import PlanQueueSuccessBehavior from '../../contexts/PockestContext/types/PlanQueueSuccessBehavior';

function QueueList() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const affordableMonsterIds = React.useMemo(() => pockestGetters.getAffordableMonsters(pockestState).map((m) => m.monster_id), [pockestState]);
  return (
    <div className="QueueList">
      <div className="QueueList-main">
        <SortableList
          items={pockestState.planQueue}
          ItemComponent={QueueItem}
          onDragEnd={(event) => {
            const {active, over} = event;
            if (!over) return;
            if (active.id === over.id) return;
            if (over.disabled) return;
            const curIndex = active?.data?.current?.sortable.index;
            const newIndex = over?.data?.current?.sortable.index;
            if (typeof newIndex !== 'number' || typeof curIndex !== 'number') return;
            const planQueue: PlanQueueItem[] = [
              ...pockestState.planQueue.slice(0, curIndex),
              ...pockestState.planQueue.slice(curIndex + 1),
            ];
            const itemToMove = pockestState.planQueue[curIndex];
            planQueue.splice(newIndex, 0, itemToMove);
            pockestDispatch?.(pockestActions.pockestPlanSettings({
              planQueue,
            }));
          }}
        />
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
                onFail: PlanQueueFailBehavior.Retry,
                onSuccess: PlanQueueSuccessBehavior.Continue,
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
