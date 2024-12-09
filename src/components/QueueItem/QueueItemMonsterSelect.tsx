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
    setQueueItem,
  } = React.useContext(QueueItemContext);
  const targetableMonsters = React.useMemo(
    () => !queueItem ? [] : pockestGetters.getTargetableMonsters(pockestState, queueItem?.planAge)
      .filter((m) => (queueItem.monsterId && queueItem.monsterId === m.monster_id) || !pockestState?.planQueue?.map((qm) => qm.monsterId).includes(m.monster_id)),
    [queueItem, pockestState],
  );
  if (!targetableMonsters?.length) return '';
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        if (!pockestDispatch || !queueItem) return;
        const monsterId = e.target.value ? parseInt(e.target.value, 10) : -1;
        setQueueItem({
          ...queueItem,
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
