import React from 'react';
import QueueMonsterSelect from '../QueueMonsterSelect';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';
import PlanQueueItem from '../../contexts/PockestContext/types/PlanQueueItem';
import QueueAgeSelect from '../QueueAgeSelect';
import { STAT_ABBR } from '../../constants/stats';

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
  const editableStartIndex = React.useMemo(
    () => pockestState?.autoQueue && !pockestState?.paused ? 1 : 0,
    [pockestState?.autoQueue, pockestState?.paused],
  );
  React.useEffect(() => {
    if (queueIndex <= editableStartIndex) setEditMode(false);
  }, [editableStartIndex, queueIndex]);
  return (
    <div className="QueueItemControls">
      <button
        type="button"
        className="PockestLink QueueItemControls-moveUp"
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
        className="PockestLink QueueItemControls-moveDown"
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
          <QueueMonsterSelect queueIndex={queueIndex} />
          {planQueueItem?.monsterId === -1 && (
            <>
              <input
                className="PockestInput"
                onChange={(e) => {
                  if (!pockestDispatch) return;
                  const planQueue: PlanQueueItem[] = [
                    ...pockestState.planQueue.slice(0, queueIndex),
                    {
                      ...planQueueItem,
                      planId: e.target.value,
                    },
                    ...pockestState.planQueue.slice(queueIndex + 1),
                  ];
                  pockestDispatch(pockestActions.pockestPlanSettings({
                    planQueue,
                  }));
                }}
                value={planQueueItem?.planId}
                pattern={`^[\\d*][ABC][LR][${Object.keys(STAT_ABBR).join('')}][1-6]$`}
                required={true}
              />
              <input
                className="PockestInput"
                onChange={(e) => {
                  if (!pockestDispatch) return;
                  const planQueue: PlanQueueItem[] = [
                    ...pockestState.planQueue.slice(0, queueIndex),
                    {
                      ...planQueueItem,
                      statPlanId: e.target.value,
                    },
                    ...pockestState.planQueue.slice(queueIndex + 1),
                  ];
                  pockestDispatch(pockestActions.pockestPlanSettings({
                    planQueue,
                  }));
                }}
                value={planQueueItem?.statPlanId}
                pattern={`^([${Object.keys(STAT_ABBR).join('')}]{0,14})$`}
                required={false}
              />
            </>
          )}
          <QueueAgeSelect queueIndex={queueIndex} />
        </>
      ) : (
        <span>
          {pockestGetters.getPlanQueueItemLabel(pockestState, planQueueItem)}
          <button
            type="button"
            className="PockestLink QueueItemControls-edit"
            aria-label={`Edit Plan Queue Item`}
            onClick={() => setEditMode(true)}
            disabled={queueIndex < editableStartIndex}
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
        disabled={queueIndex < editableStartIndex}
      >
        ❌
      </button>
    </div>
  );
}

export default QueueItemControls;
