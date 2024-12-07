import React from 'react';
import QueueMonsterSelect from '../QueueMonsterSelect';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';

interface QueueItemControlsProps {
  queueIndex: number;
}

function QueueItemControls({ queueIndex }: QueueItemControlsProps) {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const [editMode, setEditMode] = React.useState(false);
  const planQueueItem = pockestState?.planQueue?.[queueIndex];
  return (
    <div className="QueueItemControls">
      <button
        type="button"
        className="PockestLink QueueItemControls-moveUp"
        aria-label={`Move Plan Queue Item Up`}
        disabled={queueIndex === 0}
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
        className="PockestLink QueueItemControls-moveDown"
        aria-label={`Move Plan Queue Item Down`}
        disabled={queueIndex >= pockestState?.planQueue?.length - 1}
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
        <QueueMonsterSelect queueIndex={queueIndex} />
      ) : (
        <span>
          {pockestGetters.getPlanQueueItemLabel(pockestState, planQueueItem)}
          <button
            type="button"
            className="PockestLink QueueItemControls-edit"
            aria-label={`Edit Plan Queue Item`}
            onClick={() => setEditMode(true)}
          >
            ✏️
          </button>
        </span>
      )}
      <button
        type="button"
        className="PockestLink QueueItemControls-delete"
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
      >
        ❌
      </button>
    </div>
  );
}

export default QueueItemControls;
