import React from 'react';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import { QueueItemContext } from './QueueItemContext';

// TYPES
interface QueueItemAgeSelectProps {
  disabled?: boolean | null;
}

// CONSTS
const AGE_INTERVAL = {
  6: '6 (Memento + Sticker)',
  5: '5 (Sticker)',
  // 4: '4',
  // 3: '3',
  // 2: '2',
  // 1: '1 (Do nothing)',
};

function QueueItemAgeSelect({ disabled }: QueueItemAgeSelectProps) {
  const {
    pockestDispatch,
  } = usePockestContext();
  const {
    queueItem,
    setQueueItem,
  } = React.useContext(QueueItemContext);
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        if (!pockestDispatch || !queueItem) return;
        setQueueItem({
          ...queueItem,
          planAge: parseInt(e.target.value, 10),
        })
      }}
      value={queueItem?.planAge}
      disabled={!!disabled}
    >
      {Object.keys(AGE_INTERVAL).map((k) => (
        <option key={k} value={k}>
          {AGE_INTERVAL[k as unknown as keyof typeof AGE_INTERVAL]}
        </option>
      ))}
    </select>
  );
}

export default QueueItemAgeSelect;
