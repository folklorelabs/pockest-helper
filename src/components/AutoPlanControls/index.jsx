import React from 'react';
import {
  usePockestContext,
  pockestAutoPlan,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import './index.css';
import Timer from '../Timer';
import getMonsterPlan from '../../utils/getMonsterPlan';

const MONSTER_LIFESPAN = {
  1: 1 * 60 * 60 * 1000, // 1 hour
  2: 12 * 60 * 60 * 1000, // 12 hour
  3: (1 * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000), // 1 day 12 hours
  4: 3 * 24 * 60 * 60 * 1000, // 3 days
  5: 7 * 24 * 60 * 60 * 1000, // 7 days
};

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
          <span className="PockestCheck-text">Preset</span>
        </label>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Target</span>
        <TargetMonsterSelect />
      </div>
      <div className="PockestLine">
        <span className="PockestText">Plan</span>
        <span className="PockestText PockestLine-value">{targetPlan.planId ?? '--'}</span>
      </div>
      <Timer
        label={(() => {
          if (typeof curAge !== 'number') return 'Age 0 → 1';
          if (curAge < 5) return `Age ${curAge} → ${curAge + 1}`;
          if (data?.monster?.memento_flg) return `Age ${curAge} → 🎁`;
          return `Age ${curAge} → 🎁/🪦`;
        })()}
        timestamp={curAge && data?.monster
          ? data.monster.live_time + MONSTER_LIFESPAN[curAge]
          : null}
      />
    </div>
  );
}

export default AutoPlanControls;
