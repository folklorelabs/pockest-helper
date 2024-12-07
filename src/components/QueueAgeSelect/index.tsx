import {
  usePockestContext,
  pockestActions,
} from '../../contexts/PockestContext';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';

// TYPES
interface QueueAgeSelectProps {
  queueIndex: number;
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

function QueueAgeSelect({ queueIndex, disabled }: QueueAgeSelectProps) {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const planQueueItem = pockestState?.planQueue?.[queueIndex];
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        if (!pockestDispatch) return;
        const planQueue: PlanQueueItem[] = [
          ...pockestState.planQueue.slice(0, queueIndex),
          {
            ...planQueueItem,
            planAge: parseInt(e.target.value, 10),
          },
          ...pockestState.planQueue.slice(queueIndex + 1),
        ];
        pockestDispatch(pockestActions.pockestPlanSettings({
          planQueue,
        }));
      }}
      value={planQueueItem?.planAge}
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

export default QueueAgeSelect;
