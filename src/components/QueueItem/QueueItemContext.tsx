import React from 'react';
import PresetQueueItem from '../../contexts/PockestContext/types/PresetQueueItem';

// STATE
export interface QueueItemContextState {
  presetQueueItem: PresetQueueItem | null;
  queueItem: PresetQueueItem | null;
  presetQueueItemIndex?: number;
  updateQueueItem: (newQueueItem: Partial<PresetQueueItem>) => void;
  saveQueueItemToPockestState: () => void;
};

export const QUEUE_ITEM_CONTEXT_INITIAL_STATE: QueueItemContextState = {
  presetQueueItem: null,
  queueItem: null,
  presetQueueItemIndex: -1,
  updateQueueItem: () => { },
  saveQueueItemToPockestState: () => { },
};

export const QueueItemContext = React.createContext(QUEUE_ITEM_CONTEXT_INITIAL_STATE);
