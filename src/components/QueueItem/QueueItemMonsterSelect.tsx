import React from 'react';
import {
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import { QueueItemContext } from './QueueItemContext';

interface QueueMonsterSelectProps {
  disabled?: boolean | null;
}

const QueueMonsterSelect: React.FC<QueueMonsterSelectProps> = ({ disabled }) => {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    queueItem,
    presetQueueItemIndex,
    updateQueueItem,
  } = React.useContext(QueueItemContext);
  const targetableMonsters = React.useMemo(
    () => !queueItem ? [] : pockestGetters.getTargetableMonsters(pockestState),
    [queueItem, pockestState],
  );
  const estimatedBalance = React.useMemo(
    () => {
      const previousCosts = pockestState?.presetQueue?.slice(0, presetQueueItemIndex).reduce((sum, item) => {
        const egg = item.monsterId === -1
          ? pockestGetters.getPlanIdEgg(pockestState, item.planId)
          : pockestGetters.getMonsterEgg(pockestState, item.monsterId);
        const eggCost = egg?.unlock ? 0 : (egg?.buckler_point || Infinity);
        return sum + eggCost;
      }, 0);
      return pockestState?.bucklerBalance - previousCosts;
    },
    [pockestState, presetQueueItemIndex],
  );
  if (!targetableMonsters?.length) return '';
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        if (!pockestDispatch || !queueItem) return;
        const monsterId = e.target.value ? parseInt(e.target.value, 10) : -1;
        updateQueueItem({
          monsterId,
        });
      }}
      value={`${queueItem?.monsterId}`}
      disabled={!!disabled}
    >
      <option key="custom" value="-1">
        [Custom Plan]
      </option>
      {targetableMonsters.map((monster) => {
        const targetEgg = pockestGetters.getMonsterEgg(pockestState, monster?.monster_id);
        return (
          <option key={monster?.monster_id} value={monster?.monster_id}>
            {targetEgg && !targetEgg.unlock && targetEgg?.buckler_point > estimatedBalance ? '❗' : ''}
            {monster?.name_en || monster?.monster_id}
            {monster?.unlock ? ' ✓' : ''}
            {monster?.memento_flg ? ' ✓' : ''}
          </option>
        );
      })}
    </select>
  );
};

export default QueueMonsterSelect;
