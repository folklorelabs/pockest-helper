import React from 'react';
import {
  usePockestContext,
  // pockestActions,
} from '../../contexts/PockestContext';
import './index.css';
import QueueList from '../QueueList';

const QueueLogEditor: React.FC = () => {
  const {
    pockestState,
    // pockestDispatch,
  } = usePockestContext();
  return (
    <div className="QueueLogEditor">
      <header className="QueueLogEditor-header">
        <p className="QueueLogEditor-title">
          Preset Queue
          {' '}
          (
          {pockestState?.planQueue?.length || 0}
          )
        </p>
        {/* <label className="PockestCheck" htmlFor="PockestHelper_QueueLogEditorAutoQueue">
          <input
            id="PockestHelper_QueueLogEditorAutoQueue"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch && pockestDispatch(pockestActions.pockestPlanSettings({
              autoQueue: e.target.checked,
            }))}
            checked={pockestState.autoQueue}
            disabled={!pockestState.paused || (pockestState?.simpleMode && !!pockestState?.data?.monster?.live_time)}
          />
          <span className="PockestCheck-text">Queue</span>
        </label> */}
      </header>
      <div className="QueueLogEditor-content">
        <QueueList />
      </div>
    </div>
  );
};

export default QueueLogEditor;
