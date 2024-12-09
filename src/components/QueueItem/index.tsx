import React from 'react';
import classNames from 'classnames';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';
import { QueueItemProvider } from './QueueItemProvider';
import QueueItemEditor from './QueueItemEditor';
import './index.css';

interface QueueItemProps {
  queueIndex: number;
}

function QueueItem({ queueIndex }: QueueItemProps) {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const [editMode, setEditMode] = React.useState(false);
  const planQueueItem = pockestState?.planQueue?.[queueIndex];
  const editableStartIndex = React.useMemo(
    () => pockestState?.autoQueue && !pockestState?.paused ? 1 : 0,
    [pockestState?.autoQueue, pockestState?.paused],
  );
  const canAffordEgg = React.useMemo(() => {
    const monsterEgg = pockestGetters.getMonsterEgg(pockestState, planQueueItem?.monsterId);
    if (monsterEgg && (monsterEgg.unlock || (monsterEgg?.buckler_point && monsterEgg?.buckler_point <= (pockestState?.bucklerBalance || 0)))) return true;
    const planIdEgg = pockestGetters.getPlanIdEgg(pockestState, planQueueItem?.planId);
    if (planIdEgg && (planIdEgg.unlock || (planIdEgg?.buckler_point && planIdEgg?.buckler_point <= (pockestState?.bucklerBalance || 0)))) return true;
    return false;
  }, [pockestState, planQueueItem?.monsterId, planQueueItem?.planId]);
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
              className={classNames('QueueItemLabel', {
                'QueueItemLabel--cantAfford': !canAffordEgg,
              })}
            >
              {pockestGetters.getPlanQueueItemLabel(pockestState, planQueueItem)}
              {!canAffordEgg && ('💰')}
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
    </QueueItemProvider>
  );
}

export default QueueItem;
