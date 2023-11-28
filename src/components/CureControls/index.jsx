import React from 'react';
import {
  usePockestContext,
  pockestSettings,
} from '../../contexts/PockestContext';
import LogCountLine from '../LogCountLine';
import './index.css';

function CureControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    data,
    autoCure,
    paused,
  } = pockestState;
  return (
    <div className="CureControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoCure">
          <input
            id="PockestHelper_AutoCure"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoCure: e.target.checked }))}
            defaultChecked={autoCure}
            disabled={!paused}
          />
          <span className="PockestCheck-text">Cure</span>
        </label>
      </div>
      <div className="PockestLine">
        <span className="PockestText">
          Status
        </span>
        <span className="PockestText PockestLine-value">
          {(() => {
            const status = data?.monster?.status;
            if (status === 1) return 'Normal';
            if (status === 2) return 'Stunned';
            return 'Unknown';
          })()}
        </span>
      </div>
      <LogCountLine
        title="Cures"
        logTypes={['cure']}
      />
    </div>
  );
}

export default CureControls;
