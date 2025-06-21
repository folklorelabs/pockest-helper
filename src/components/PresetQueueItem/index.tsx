import React from 'react';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';
import { getMonsterById } from '../../contexts/PockestContext/getters/monster';
import { usePockestContext } from '../../contexts/PockestContext';
import { SortableItem } from '../SortableItem';

type PresetQueueItemProps = {
    item: SortableItem;
}
export default function PresetQueueItem({
    item,
}: PresetQueueItemProps) {
    const queueItem = item as PlanQueueItem;
    const {
        pockestState,
    } = usePockestContext();
  
    const monster = typeof queueItem.monsterId === 'number' ? getMonsterById(pockestState, queueItem.monsterId) : null;
    return (
      <p>{monster ? `${monster.name_en} (${queueItem.planAge})` : `${queueItem.planId}-${queueItem.statPlanId}`}</p>
    );
}