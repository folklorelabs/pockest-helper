import React from 'react';
import {
  usePockestContext,
  pockestAutoPlan,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import './index.css';
import Timer from '../Timer';
import getMonsterPlan from '../../utils/getTargetMonsterPlan';
import getAgeTimer from '../../utils/getAgeTimer';

function AutoPlanControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    data,
    monsterId,
    autoPlan,
    paused,
  } = pockestState;
  const targetPlan = React.useMemo(() => getMonsterPlan(pockestState), [pockestState]);
  const curAge = data?.monster?.age;
  return (
    <div className="AutoPlanControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoPlan">
          <input
            id="PockestHelper_AutoPlan"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestAutoPlan({
              autoPlan: e.target.checked,
              monsterId,
              pockestState,
            }))}
            checked={autoPlan}
            disabled={!paused}
          />
          <span className="PockestCheck-text">Preset</span>
        </label>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Target</span>
        <TargetMonsterSelect />
      </div>
      <div className="PockestLine">
        <span className="PockestText">Plan</span>
        <span className="PockestText PockestLine-value">{targetPlan?.planId || '--'}</span>
      </div>
      <Timer
        label={(() => {
          if (typeof curAge !== 'number') return 'Age 0 → 1';
          if (curAge < 5) return `Age ${curAge} → ${curAge + 1}`;
          if (data?.monster?.memento_point > data?.monster?.max_memento_point) return `Age ${curAge} → 🎁`;
          return `Age ${curAge} → 🎁/🪦`;
        })()}
        timestamp={getAgeTimer(pockestState)}
      />
      <Timer
        label="Big Event*"
        timestamp={data?.next_big_event_timer}
      />
    </div>
  );
}

export default AutoPlanControls;
