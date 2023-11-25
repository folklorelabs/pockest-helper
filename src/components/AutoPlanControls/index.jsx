import React from 'react';
import {
  usePockestContext,
  pockestAutoPlan,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import './index.css';
import Timer from '../Timer';
import getMonsterPlan from '../../utils/getMonsterPlan';

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
  const targetPlan = React.useMemo(() => getMonsterPlan(monsterId), [monsterId]);
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
              age: data?.monster?.age,
            }))}
            defaultChecked={autoPlan}
            disabled={!paused}
          />
          <span className="PockestCheck-text">Auto-Plan</span>
        </label>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Target</span>
        <TargetMonsterSelect />
      </div>
      <div className="PockestLine">
        <span className="PockestText">Plan</span>
        <span className="PockestText">{targetPlan.planId ?? '--'}</span>
      </div>
      <Timer
        label={(() => {
          if (typeof curAge !== 'number') return 'Egg';
          if (curAge < 5) return `Age ${curAge} → ${curAge + 1}`;
          if (data?.monster?.memento_flg) return `Age ${curAge} → 🎁`;
          return `Age ${curAge} → 🎁/🪦`;
        })()}
        timestamp={data?.next_big_event_timer}
      />
    </div>
  );
}

export default AutoPlanControls;
