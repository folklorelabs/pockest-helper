import React from 'react';

import { QueueItemContext } from './QueueItemContext';
import { pockestActions, usePockestContext } from '../../contexts/PockestContext';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';
import parsePlanId from '../../utils/parsePlanId';

// TYPES
interface QueueItemProviderProps {
  children: React.ReactNode;
  planQueueItem: PlanQueueItem;
}

export function QueueItemProvider({
  planQueueItem,
  children,
}: QueueItemProviderProps) {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const [localPlanQueueItem, setLocalPlanQueueItem] = React.useState<PlanQueueItem>(planQueueItem);
  const planQueueItemIndex = React.useMemo(
    () => pockestState.planQueue.findIndex((item) => item.id === planQueueItem.id),
    [pockestState.planQueue, planQueueItem],
  );
  const updateQueueItem = React.useCallback((newQueueItem: Partial<PlanQueueItem>) => {
    const item = {
      ...localPlanQueueItem,
      ...newQueueItem,
      id: localPlanQueueItem.id,
    }
    const monster = pockestState.allMonsters.find((m) => m.monster_id === item.monsterId);
    if (newQueueItem?.monsterId && newQueueItem.monsterId >= 0) {
      item.planId = monster?.planId || '';
      const parsedPlanId = parsePlanId(item.planId);
      item.statPlanId = monster?.statPlan || parsedPlanId?.primaryStatLetter.repeat(6) || '';
    }
    return setLocalPlanQueueItem(item);
  }, [localPlanQueueItem, pockestState.allMonsters]);
  const saveQueueItemToPockestState = React.useCallback(() => {
    if (!pockestDispatch) return;
    const planQueue: PlanQueueItem[] = [
      ...pockestState.planQueue.slice(0, planQueueItemIndex),
      localPlanQueueItem,
      ...pockestState.planQueue.slice(planQueueItemIndex + 1),
    ];
    pockestDispatch(pockestActions.pockestPlanSettings({
      planQueue,
    }));
  }, [pockestDispatch, pockestState.planQueue, planQueueItemIndex, localPlanQueueItem]);

  // wrap value in memo so we only re-render when necessary
  const providerValue = React.useMemo(() => ({
    planQueueItem,
    planQueueItemIndex,
    queueItem: localPlanQueueItem,
    updateQueueItem,
    saveQueueItemToPockestState,
  }), [
    planQueueItem,
    planQueueItemIndex,
    localPlanQueueItem,
    updateQueueItem,
    saveQueueItemToPockestState,
  ]);

  return (
    <QueueItemContext.Provider value={providerValue}>
      {children}
    </QueueItemContext.Provider>
  );
}
