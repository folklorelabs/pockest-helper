import React from 'react';
import PresetQueueItem from '../../contexts/PockestContext/types/PresetQueueItem';

// STATE
export interface QueueItemContextState {
  presetQueueItem: PresetQueueItem | null;
  queueItem: PresetQueueItem | null;
  presetQueueItemIndex?: number;
  editMode: boolean;
  setEditMode: (newEditMode: boolean) => void
  updateQueueItem: (newQueueItem: Partial<PresetQueueItem>) => void;
  saveQueueItemToPockestState: () => void;
};

export const QUEUE_ITEM_CONTEXT_INITIAL_STATE: QueueItemContextState = {
  presetQueueItem: null,
  queueItem: null,
  presetQueueItemIndex: -1,
  editMode: false,
  setEditMode: () => { },
  updateQueueItem: () => { },
  saveQueueItemToPockestState: () => { },
};

export const QueueItemContext = React.createContext(QUEUE_ITEM_CONTEXT_INITIAL_STATE);
