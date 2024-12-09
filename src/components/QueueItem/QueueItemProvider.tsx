import React from 'react';

import { QueueItemContext } from './QueueItemContext';
import { pockestActions, usePockestContext } from '../../contexts/PockestContext';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';

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
    queueItem: localPlanQueueItem,
    setQueueItem: setLocalPlanQueueItem,
    resetQueueItem: () => setLocalPlanQueueItem(planQueueItem),
    saveQueueItemToPockestState,
  }), [planQueueItem, localPlanQueueItem, setLocalPlanQueueItem, saveQueueItemToPockestState]);

  return (
    <QueueItemContext.Provider value={providerValue}>
      {children}
    </QueueItemContext.Provider>
  );
}
