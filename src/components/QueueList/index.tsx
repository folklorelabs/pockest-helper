// import React from 'react';

import React from 'react';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import parsePlanId from '../../utils/parsePlanId';
import { AGE_INTERVAL } from '../QueueItem/constants/AGE_INTERVAL';
import SortableQueueList from './SortableQueueList';
import './index.css';

function QueueList() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const affordableMonsterIds = React.useMemo(
    () =>
      pockestGetters
        .getAffordableMonsters(pockestState)
        .map((m) => m.monster_id),
    [
      pockestState,
    ],
  );
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
            const targetableMonsters = pockestGetters
              .getTargetableMonsters(pockestState, 6)
              .filter(
                (m) =>
                  !pockestState.presetQueue
                    ?.map((qm) => qm.monsterId)
                    .includes(m.monster_id),
              )
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
                  (monsterToAdd?.unlock ? 6 : 5),
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
          id="QueueList-ageSelect"
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
          <option value=""></option>
          {Object.keys(AGE_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {AGE_INTERVAL[k as unknown as keyof typeof AGE_INTERVAL]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default QueueList;
