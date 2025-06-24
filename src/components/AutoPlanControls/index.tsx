import React from 'react';
import {
  usePockestContext,
  pockestActions,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import AutoPlanSettingInput from '../AutoPlanSettingInput';
import TargetAgeSelect from '../TargetAgeSelect';
import AutoPlanControlsPlanLabel from './AutoPlanControls-planLabel';
import AutoPlanControlsStatPlanLabel from './AutoPlanControls-statPlanLabel';
import './index.css';

function AutoPlanControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    autoPlan,
    paused,
  } = pockestState;
  return (
    <div className="AutoPlanControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoPlan">
          <input
            id="PockestHelper_AutoPlan"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch && pockestDispatch(pockestActions.pockestPlanSettings({
              autoPlan: e.target.checked,
            }))}
            checked={autoPlan}
            disabled={!paused || pockestState.autoQueue}
          />
          <span className="PockestCheck-text">Preset</span>
        </label>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Target</span>
        <TargetMonsterSelect />
      </div>
      <div className="PockestLine">
        <AutoPlanControlsPlanLabel />
        <AutoPlanSettingInput settingName="planId" required />
      </div>
      <div className="PockestLine">

        <AutoPlanControlsStatPlanLabel />
        <AutoPlanSettingInput settingName="statPlanId" />
      </div>
      <div className="PockestLine">
        <span className="PockestText">Target Age</span>
        <TargetAgeSelect />
      </div>
    </div>
  );
}

export default AutoPlanControls;
