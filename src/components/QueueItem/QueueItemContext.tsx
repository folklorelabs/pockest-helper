import React from 'react';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';

// STATE
export interface QueueItemContextState {
  queueItem?: PlanQueueItem | null;
  setQueueItem: React.Dispatch<React.SetStateAction<PlanQueueItem>>;
  resetQueueItem: () => void;
  saveQueueItemToPockestState: () => void;
};

export const QUEUE_ITEM_CONTEXT_INITIAL_STATE: QueueItemContextState = {
  queueItem: null,
  setQueueItem: () => { },
  resetQueueItem: () => { },
  saveQueueItemToPockestState: () => { },
};

export const QueueItemContext = React.createContext(QUEUE_ITEM_CONTEXT_INITIAL_STATE);
