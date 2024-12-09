import React from 'react';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';

// STATE
export interface QueueItemContextState {
  planQueueItem: PlanQueueItem | null;
  queueItem: PlanQueueItem | null;
  planQueueItemIndex?: number;
  updateQueueItem: (newQueueItem: Partial<PlanQueueItem>) => void;
  saveQueueItemToPockestState: () => void;
};

export const QUEUE_ITEM_CONTEXT_INITIAL_STATE: QueueItemContextState = {
  planQueueItem: null,
  queueItem: null,
  planQueueItemIndex: -1,
  updateQueueItem: () => { },
  saveQueueItemToPockestState: () => { },
};

export const QueueItemContext = React.createContext(QUEUE_ITEM_CONTEXT_INITIAL_STATE);
