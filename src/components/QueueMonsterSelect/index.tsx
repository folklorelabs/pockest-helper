import React from 'react';
import {
  pockestGetters,
  pockestActions,
  usePockestContext,
} from '../../contexts/PockestContext';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';

interface QueueMonsterSelectProps {
  disabled?: boolean | null;
  queueIndex: number;
}

const QueueMonsterSelect: React.FC<QueueMonsterSelectProps> = ({ disabled, queueIndex }) => {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const planQueueItem = pockestState?.planQueue?.[queueIndex];
  const targetableMonsters = React.useMemo(() => pockestGetters.getTargetableMonsters(pockestState).filter((m) => {
    const completed = (planQueueItem?.planAge === 5 && m.unlock) || (planQueueItem?.planAge === 6 && m.memento_flg);
    return !completed;
  }), [planQueueItem?.planAge, pockestState]);
  if (!targetableMonsters?.length) return '';
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        if (!pockestDispatch) return;
        const monsterId = e.target.value ? parseInt(e.target.value, 10) : -1;
        const planQueue: PlanQueueItem[] = [
          ...pockestState.planQueue.slice(0, queueIndex),
          {
            ...planQueueItem,
            monsterId,
          },
          ...pockestState.planQueue.slice(queueIndex + 1),
        ];
        pockestDispatch(pockestActions.pockestPlanSettings({
          planQueue,
        }));
      }}
      value={`${planQueueItem?.monsterId}`}
      disabled={!!disabled}
    >
      <option key="custom" value="-1">
        [Custom Plan]
      </option>
      {targetableMonsters.map((monster) => {
        const targetEgg = pockestGetters.getMonsterEgg(pockestState, monster?.monster_id);
        return (
          <option key={monster?.monster_id} value={monster?.monster_id}>
            {monster?.name_en || monster?.monster_id}
            {targetEgg && !targetEgg.unlock && targetEgg?.buckler_point > (pockestState.bucklerBalance || 0) ? ' 💰' : ''}
            {monster?.unlock ? ' ✓' : ''}
            {monster?.memento_flg ? ' ✓' : ''}
          </option>
        );
      })}
    </select>
  );
};

export default QueueMonsterSelect;
