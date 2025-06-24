import React from 'react';

import { QueueItemContext } from './QueueItemContext';
import { pockestActions, usePockestContext } from '../../contexts/PockestContext';
import PresetQueueItem from '../../contexts/PockestContext/types/PresetQueueItem';
import parsePlanId from '../../utils/parsePlanId';

// TYPES
interface QueueItemProviderProps {
  children: React.ReactNode;
  presetQueueItem: PresetQueueItem;
}

export function QueueItemProvider({
  presetQueueItem,
  children,
}: QueueItemProviderProps) {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const [localPresetQueueItem, setLocalPresetQueueItem] = React.useState<PresetQueueItem>(presetQueueItem);
  const presetQueueItemIndex = React.useMemo(
    () => pockestState.presetQueue.findIndex((item) => item.id === presetQueueItem.id),
    [pockestState.presetQueue, presetQueueItem],
  );
  const updateQueueItem = React.useCallback((newQueueItem: Partial<PresetQueueItem>) => {
    const item = {
      ...localPresetQueueItem,
      ...newQueueItem,
      id: localPresetQueueItem.id,
    }
    const monster = pockestState.allMonsters.find((m) => m.monster_id === item.monsterId);
    if (newQueueItem?.monsterId && newQueueItem.monsterId >= 0) {
      item.planId = monster?.planId || '';
      const parsedPlanId = parsePlanId(item.planId);
      item.statPlanId = monster?.statPlan || parsedPlanId?.primaryStatLetter.repeat(6) || '';
    }
    return setLocalPresetQueueItem(item);
  }, [localPresetQueueItem, pockestState.allMonsters]);
  const saveQueueItemToPockestState = React.useCallback(() => {
    if (!pockestDispatch) return;
    const presetQueue: PresetQueueItem[] = [
      ...pockestState.presetQueue.slice(0, presetQueueItemIndex),
      localPresetQueueItem,
      ...pockestState.presetQueue.slice(presetQueueItemIndex + 1),
    ];
    pockestDispatch(pockestActions.pockestPlanSettings({
      presetQueue,
    }));
  }, [pockestDispatch, pockestState.presetQueue, presetQueueItemIndex, localPresetQueueItem]);

  // wrap value in memo so we only re-render when necessary
  const providerValue = React.useMemo(() => ({
    presetQueueItem,
    presetQueueItemIndex,
    queueItem: localPresetQueueItem,
    updateQueueItem,
    saveQueueItemToPockestState,
  }), [
    presetQueueItem,
    presetQueueItemIndex,
    localPresetQueueItem,
    updateQueueItem,
    saveQueueItemToPockestState,
  ]);

  return (
    <QueueItemContext.Provider value={providerValue}>
      {children}
    </QueueItemContext.Provider>
  );
}
