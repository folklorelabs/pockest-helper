import {
  pockestActions,
  usePockestContext,
} from '../../contexts/PockestContext';
import QueueItem from '../QueueItem';
import SortableList from '../SortableList';
import './index.css';
import PresetQueueItem from '../../contexts/PockestContext/types/PresetQueueItem';

function SortableQueueList() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  return (
    <SortableList
        items={pockestState.presetQueue.map((item) => {
          const disabled = pockestState?.presetQueueId === item.id;
          return {
            disabled,
            ...item,
          };
        })}
        ItemComponent={QueueItem}
        onDragEnd={(event) => {
          const {active, over} = event;
          if (!over) return;
          if (active.id === over.id) return;
          if (over.disabled) return;
          const curIndex = active?.data?.current?.sortable.index;
          const newIndex = over?.data?.current?.sortable.index;
          if (typeof newIndex !== 'number' || typeof curIndex !== 'number') return;
          const presetQueue: PresetQueueItem[] = [
              ...pockestState.presetQueue.slice(0, curIndex),
              ...pockestState.presetQueue.slice(curIndex + 1),
          ];
          const itemToMove = pockestState.presetQueue[curIndex];
          presetQueue.splice(newIndex, 0, itemToMove);
          pockestDispatch?.(pockestActions.pockestPlanSettings({
              presetQueue,
          }));
        }}
    />
  );
}

export default SortableQueueList;
