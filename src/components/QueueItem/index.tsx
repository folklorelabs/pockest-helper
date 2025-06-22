import React from 'react';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import PresetQueueItem from '../../contexts/PockestContext/types/PresetQueueItem';
import { QueueItemProvider } from './QueueItemProvider';
import QueueItemEditor from './QueueItemEditor';
import { SortableItemComponent } from '../SortableItem';
import './index.css';

type ComponentProps = React.ComponentProps<SortableItemComponent>;
type ComponentReturn = ReturnType<SortableItemComponent>;

function QueueItem({
  item,
  dragAttributes,
  dragListeners,
}: ComponentProps): ComponentReturn {
  const presetQueueItem = item as PresetQueueItem;
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const queueIndex = React.useMemo(
    () => pockestState.presetQueue.findIndex(({ id }) => id === presetQueueItem.id),
    [pockestState],
  );
  const [editMode, setEditMode] = React.useState(false);
  const editableStartIndex = React.useMemo(
    () => pockestState?.autoQueue && !pockestState?.paused ? 1 : 0,
    [pockestState?.autoQueue, pockestState?.paused],
  );
  const planEgg = React.useMemo(
    () => presetQueueItem?.monsterId === -1
      ? pockestGetters.getPlanIdEgg(pockestState, presetQueueItem?.planId)
      : pockestGetters.getMonsterEgg(pockestState, presetQueueItem?.monsterId),
    [pockestState, presetQueueItem],
  );
  const estimatedBalance = React.useMemo(
    () => {
      const previousCosts = pockestState?.presetQueue?.slice(0, queueIndex).reduce((sum, item) => {
        const egg = item.monsterId === -1
          ? pockestGetters.getPlanIdEgg(pockestState, item.planId)
          : pockestGetters.getMonsterEgg(pockestState, item.monsterId);
        const eggCost = egg?.unlock ? 0 : (egg?.buckler_point || Infinity);
        return sum + eggCost;
      }, 0);
      return pockestState?.bucklerBalance - previousCosts;
    },
    [pockestState, queueIndex],
  );
  const canAffordEgg = React.useMemo(
    () => planEgg && (planEgg.unlock || ((planEgg?.buckler_point || Infinity) <= estimatedBalance)),
    [planEgg, estimatedBalance],
  );
  React.useEffect(() => {
    if (queueIndex <= editableStartIndex) setEditMode(false);
  }, [editableStartIndex, queueIndex]);
  return (
    <QueueItemProvider presetQueueItem={presetQueueItem}>
      <div className="QueueItem">
        <button className="QueueItem-dragHandle" {...dragAttributes} {...dragListeners}>
          ⠿
        </button>
        <button
          type="button"
          className="PockestLink QueueItem-moveUp"
          aria-label={`Move Plan Queue Item Up`}
          disabled={queueIndex <= editableStartIndex}
          onClick={() => {
            if (!pockestDispatch) return;
            const presetQueue: PresetQueueItem[] = [
              ...pockestState.presetQueue.slice(0, queueIndex),
              ...pockestState.presetQueue.slice(queueIndex + 1),
            ];
            presetQueue.splice(queueIndex - 1, 0, presetQueueItem);
            pockestDispatch(pockestActions.pockestPlanSettings({
              presetQueue,
            }));
          }}
        >
          ⬆️
        </button>
        <button
          type="button"
          className="PockestLink QueueItem-moveDown"
          aria-label={`Move Plan Queue Item Down`}
          disabled={queueIndex < editableStartIndex || queueIndex >= pockestState?.presetQueue?.length - 1}
          onClick={() => {
            if (!pockestDispatch) return;
            const presetQueue: PresetQueueItem[] = [
              ...pockestState.presetQueue.slice(0, queueIndex),
              ...pockestState.presetQueue.slice(queueIndex + 1),
            ];
            presetQueue.splice(queueIndex + 1, 0, presetQueueItem);
            pockestDispatch(pockestActions.pockestPlanSettings({
              presetQueue,
            }));
          }}
        >
          ⬇️
        </button>
        {!canAffordEgg && (
          <>
            <span className="PockestToolTip PockestToolTip--right PockestToolTip--bottom">
              <span className="QueueItemLabel-cantAfford">❗</span>
              <span className="PockestToolTip-text">
                Your <em>Buckler point</em> balance may be insufficient to cover this egg purchase ({planEgg?.buckler_point}) once it is reached in the queue.<br />
                This is based on your estimated balance at this point in the queue ({Math.max(0, estimatedBalance ?? 0)}).
              </span>
            </span>
            {' '}
          </>
        )}
        {editMode ? (
          <>
            <QueueItemEditor />
            <button
              type="button"
              className="PockestLink"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <span
              className="QueueItemLabel"
            >
              {pockestGetters.getPresetQueueItemLabel(pockestState, presetQueueItem)}
            </span>
            <button
              type="button"
              className="PockestLink QueueItem-edit"
              aria-label={`Edit Plan Queue Item`}
              onClick={() => setEditMode(true)}
              disabled={queueIndex < editableStartIndex}
            >
              ✏️
            </button>
            <button
              type="button"
              className="PockestLink QueueItem-delete"
              aria-label={`Delete Plan Queue Item`}
              onClick={() => {
                if (!pockestDispatch) return;
                const presetQueue: PresetQueueItem[] = [
                  ...pockestState.presetQueue.slice(0, queueIndex),
                  ...pockestState.presetQueue.slice(queueIndex + 1),
                ];
                console.log({presetQueue, queueIndex});
                pockestDispatch(pockestActions.pockestPlanSettings({
                  presetQueue,
                }));
              }}
              disabled={queueIndex < editableStartIndex}
            >
              ❌
            </button>
          </>
        )}
      </div>
    </QueueItemProvider >
  );
}

export default QueueItem;
