import React from 'react';
import {
  usePockestContext,
  pockestAutoPlan,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import Timer from '../Timer';
import Memento from '../Memento';
import getMonsterPlan from '../../utils/getTargetMonsterPlan';
import getAgeTimer from '../../utils/getAgeTimer';
import './index.css';

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
  const nextBigEventTypes = React.useMemo(() => getBigEventTypes(pockestState), [pockestState]);
  const curAge = data?.monster?.age;
  const ageLabel = React.useMemo(() => {
    if (typeof curAge !== 'number') return 'Age 0 → 1';
    if (curAge < 5) return `Age ${curAge} → ${curAge + 1}`;
    return (
      <>
        {`Age ${curAge} → `}
        <Memento />
      </>
    );
  }, [curAge]);
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
        label={ageLabel}
        timestamp={getAgeTimer(pockestState)}
      />
      <Timer
        label={(() => {
          if (nextBigEventTypes.includes(BIG_EVENTS.AGE)) return 'Age Event';
          if (nextBigEventTypes.includes(BIG_EVENTS.STOMACH_EMPTY)) return 'Starvation';
          if (nextBigEventTypes.includes(BIG_EVENTS.GARBAGE_FULL)) return 'Poop Full';
          if (nextBigEventTypes.includes(BIG_EVENTS.STOMACH_STUN)) return 'Hunger Stun';
          if (nextBigEventTypes.includes(BIG_EVENTS.GARBAGE_STUN)) return 'Poop Stun';
          if (nextBigEventTypes.includes(BIG_EVENTS.STOMACH_DEATH)) return 'Hunger Death';
          if (nextBigEventTypes.includes(BIG_EVENTS.GARBAGE_DEATH)) return 'Poop Death';
          return 'Unknown';
        })()}
        timestamp={data?.next_big_event_timer}
      />
    </div>
  );
}

export default AutoPlanControls;
