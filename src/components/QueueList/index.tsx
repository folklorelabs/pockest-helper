import React from 'react';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import parsePlanId from '../../utils/parsePlanId';
import SortableQueueList from './SortableQueueList';
import './index.css';

function QueueList() {
  const uniqueId = React.useId();
  const { pockestState, pockestDispatch } = usePockestContext();
  return (
    <div className="QueueList">
      <div className="QueueList-main">
        <SortableQueueList />
      </div>
      <div className="QueueList-buttons">
        <button
          type="button"
          className="PockestLink QueueList-add"
          aria-label={`Add Plan Queue`}
          onClick={() => {
            if (!pockestDispatch) return;
            const targetableMementoMonsters = pockestGetters.getRequiredMementoMonsterIds(pockestState, true);
            const targetableMonsters = pockestGetters.getTargetableMonsters(pockestState, 6, true)
              .filter(
                (m) =>
                  !pockestState.presetQueue
                    ?.map((qm) => qm.monsterId)
                    .includes(m.monster_id),
              )
              .filter((m) => !m.memento_flg)
              .filter((m) => !m.unlock || (m.monster_id && targetableMementoMonsters.includes(m.monster_id)) || (pockestState.presetQueueAgePref || 0) > 5)
              .sort((a, b) => {
                const aReqMemento = a.monster_id ? targetableMementoMonsters.includes(a.monster_id) : false;
                const bReqMemento = b.monster_id ? targetableMementoMonsters.includes(b.monster_id) : false;
                const aUnlockNoMem = a.unlock && !aReqMemento;
                const baUnlockNoMem = a.unlock && !aReqMemento;
                if (!aUnlockNoMem && baUnlockNoMem) return -1;
                if (aUnlockNoMem && !baUnlockNoMem) return 1;
                if ((a.eggIds?.[0] || 0) < (b.eggIds?.[0] || 0)) return -1;
                if ((a.eggIds?.[0] || 0) > (b.eggIds?.[0] || 0)) return 1;
                if (aReqMemento && !bReqMemento) return -1;
                if (!aReqMemento && bReqMemento) return 1;
                return 0;
              });
            const monsterToAdd = targetableMonsters[0];
            const isMementoTarget = monsterToAdd.monster_id ? targetableMementoMonsters.includes(monsterToAdd.monster_id) : false;
            const planId = monsterToAdd?.planId || '1BRP6';
            const monsterToAddParsedPlanId = parsePlanId(planId);
            const statPlanId =
              monsterToAdd?.statPlan ||
              monsterToAddParsedPlanId?.primaryStatLetter.repeat(6) ||
              '';
            const presetQueue = [
              ...(pockestState.presetQueue || []),
              {
                id: window.crypto.randomUUID(),
                monsterId: monsterToAdd?.monster_id || -1,
                planAge: 
                  pockestState?.presetQueueAgePref ||
                  (monsterToAdd?.unlock || isMementoTarget ? 6 : 5),
                planId: monsterToAdd?.planId || '1BRP6',
                statPlanId,
              },
            ];
            pockestDispatch(
              pockestActions.pockestSettings({
                presetQueue,
              }),
            );
          }}
        >
          ➕ Add
        </button>
        <select
          className="PockestSelect QueueList-ageSelect"
          id={`QueueList-ageSelect${uniqueId}`}
          onChange={(e) => {
            if (!pockestDispatch) return;
            const newAge = parseInt(e.target.value, 10);
            pockestDispatch(
              pockestActions.pockestSettings({
                presetQueueAgePref: newAge,
              }),
            );
          }}
          value={pockestState?.presetQueueAgePref}
        >
          <option value="0">Sticker Completion</option>
          <option value="6">Memento Completion</option>
        </select>
      </div>
    </div>
  );
}

export default QueueList;
