import React from 'react';
import QueueItemMonsterSelect from './QueueItemMonsterSelect';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import QueueItemAgeSelect from './QueueItemAgeSelect';
import { STAT_ABBR } from '../../constants/stats';
import { QueueItemContext } from './QueueItemContext';
import './index.css';

function QueueItemEditor() {
  const {
    pockestDispatch,
  } = usePockestContext();
  const {
    presetQueueItem,
    queueItem,
    updateQueueItem,
    saveQueueItemToPockestState,
    setEditMode,
  } = React.useContext(QueueItemContext);
  const isDirty = React.useMemo(() => JSON.stringify(presetQueueItem) === JSON.stringify(queueItem), [presetQueueItem, queueItem]);
  return (
    <div className="QueueItemEditor">
      <QueueItemMonsterSelect />
      {queueItem?.monsterId !== -1 && (
        <QueueItemAgeSelect />
      )}
      {queueItem?.monsterId === -1 && (
        <>
          <input
            className="PockestInput"
            onChange={(e) => {
              if (!pockestDispatch || !queueItem) return;
              updateQueueItem({
                planId: e.target.value,
              });
            }}
            value={queueItem?.planId}
            pattern={`^[\\d]*[ABC][LR][${Object.keys(STAT_ABBR).join('')}][1-6]$`}
            required={true}
          />
          <input
            className="PockestInput"
            onChange={(e) => {
              if (!pockestDispatch || !queueItem) return;
              updateQueueItem({
                statPlanId: e.target.value,
              });
            }}
            value={queueItem?.statPlanId}
            pattern={`^([${Object.keys(STAT_ABBR).join('')}]{0,14})$`}
            required={false}
          />
        </>
      )}
      <button
        type="button"
        className="PockestLink"
        onClick={async () => {
          await saveQueueItemToPockestState();
          setEditMode(false);
        }}
        disabled={isDirty}
      >
        Save
      </button>
    </div>
  );
}

export default QueueItemEditor;
