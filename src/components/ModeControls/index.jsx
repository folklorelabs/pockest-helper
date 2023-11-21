import React from 'react';
import {
  pockestSettings,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';

function Controls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    data,
    autoPlan,
  } = pockestState;
  if (!data || !data.monster) return '';
  return (
    <div className="ModeControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_ManualPlan">
          <input
            name="PockestHelper_Mode"
            id="PockestHelper_ManualPlan"
            className="PockestCheck-input"
            type="radio"
            onChange={(e) => pockestDispatch(pockestSettings({ autoPlan: !e.target.checked }))}
            defaultChecked={!autoPlan}
          />
          <span className="PockestCheck-text">Manual</span>
        </label>
        <label className="PockestCheck" htmlFor="PockestHelper_AutoPlan">
          <input
            name="PockestHelper_Mode"
            id="PockestHelper_AutoPlan"
            className="PockestCheck-input"
            type="radio"
            onChange={(e) => pockestDispatch(pockestSettings({ autoPlan: e.target.checked }))}
            defaultChecked={autoPlan}
          />
          <span className="PockestCheck-text">Auto-Plan</span>
        </label>
      </div>
    </div>
  );
}

export default Controls;
