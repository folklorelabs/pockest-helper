import React from 'react';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';
import { QueueItemProvider } from './QueueItemProvider';
import QueueItemEditor from './QueueItemEditor';
import { SortableItem } from '../SortableItem';
import './index.css';

interface QueueItemProps {
  item: SortableItem;
}

function QueueItem({ item }: QueueItemProps) {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const planQueueItem = item as PlanQueueItem;
  const queueIndex = pockestState.planQueue.findIndex(({ id }) => id === planQueueItem.id);
  const [editMode, setEditMode] = React.useState(false);
  const editableStartIndex = React.useMemo(
    () => pockestState?.autoQueue && !pockestState?.paused ? 1 : 0,
    [pockestState?.autoQueue, pockestState?.paused],
  );
  const planEgg = React.useMemo(
    () => planQueueItem?.monsterId === -1
      ? pockestGetters.getPlanIdEgg(pockestState, planQueueItem?.planId)
      : pockestGetters.getMonsterEgg(pockestState, planQueueItem?.monsterId),
    [pockestState, planQueueItem],
  );
  const estimatedBalance = React.useMemo(
    () => {
      const previousCosts = pockestState?.planQueue?.slice(0, queueIndex).reduce((sum, item) => {
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
    <QueueItemProvider planQueueItem={planQueueItem}>
      <div className="QueueItem">
        <button
          type="button"
          className="PockestLink QueueItem-moveUp"
          aria-label={`Move Plan Queue Item Up`}
          disabled={queueIndex <= editableStartIndex}
          onClick={() => {
            if (!pockestDispatch) return;
            const planQueue: PlanQueueItem[] = [
              ...pockestState.planQueue.slice(0, queueIndex),
              ...pockestState.planQueue.slice(queueIndex + 1),
            ];
            planQueue.splice(queueIndex - 1, 0, planQueueItem);
            pockestDispatch(pockestActions.pockestPlanSettings({
              planQueue,
            }));
          }}
        >
          ⬆️
        </button>
        <button
          type="button"
          className="PockestLink QueueItem-moveDown"
          aria-label={`Move Plan Queue Item Down`}
          disabled={queueIndex < editableStartIndex || queueIndex >= pockestState?.planQueue?.length - 1}
          onClick={() => {
            if (!pockestDispatch) return;
            const planQueue: PlanQueueItem[] = [
              ...pockestState.planQueue.slice(0, queueIndex),
              ...pockestState.planQueue.slice(queueIndex + 1),
            ];
            planQueue.splice(queueIndex + 1, 0, planQueueItem);
            pockestDispatch(pockestActions.pockestPlanSettings({
              planQueue,
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
              {pockestGetters.getPlanQueueItemLabel(pockestState, planQueueItem)}
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
                const planQueue: PlanQueueItem[] = [
                  ...pockestState.planQueue.slice(0, queueIndex),
                  ...pockestState.planQueue.slice(queueIndex + 1),
                ];
                pockestDispatch(pockestActions.pockestPlanSettings({
                  planQueue,
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
