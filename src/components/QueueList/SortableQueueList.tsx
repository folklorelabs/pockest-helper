import {
  pockestActions,
  usePockestContext,
} from '../../contexts/PockestContext';
import QueueItem from '../QueueItem';
import SortableList from '../SortableList';
import './index.css';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';

function SortableQueueList() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  return (
    <SortableList
        items={pockestState.planQueue}
        ItemComponent={QueueItem}
        onDragEnd={(event) => {
        const {active, over} = event;
        if (!over) return;
        if (active.id === over.id) return;
        if (over.disabled) return;
        const curIndex = active?.data?.current?.sortable.index;
        const newIndex = over?.data?.current?.sortable.index;
        if (typeof newIndex !== 'number' || typeof curIndex !== 'number') return;
        const planQueue: PlanQueueItem[] = [
            ...pockestState.planQueue.slice(0, curIndex),
            ...pockestState.planQueue.slice(curIndex + 1),
        ];
        const itemToMove = pockestState.planQueue[curIndex];
        planQueue.splice(newIndex, 0, itemToMove);
        pockestDispatch?.(pockestActions.pockestPlanSettings({
            planQueue,
        }));
        }}
    />
  );
}

export default SortableQueueList;
