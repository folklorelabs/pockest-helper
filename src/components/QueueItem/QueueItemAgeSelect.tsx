import React from 'react';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import { QueueItemContext } from './QueueItemContext';
import { AGE_INTERVAL } from './constants/AGE_INTERVAL';

// TYPES
interface QueueItemAgeSelectProps {
  disabled?: boolean | null;
}

function QueueItemAgeSelect({ disabled }: QueueItemAgeSelectProps) {
  const {
    pockestDispatch,
  } = usePockestContext();
  const {
    queueItem,
    updateQueueItem,
  } = React.useContext(QueueItemContext);
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        if (!pockestDispatch || !queueItem) return;
        const newAge = parseInt(e.target.value, 10);
        updateQueueItem({
          planAge: newAge,
        });
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
