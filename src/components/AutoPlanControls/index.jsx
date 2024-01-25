import React from 'react';
import {
  usePockestContext,
  pockestPlanSettings,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import AutoPlanSettingInput from '../AutoPlanSettingInput';
import Timer from '../Timer';
import Memento from '../Memento';
import getAgeTimer from '../../utils/getAgeTimer';
import getStunTimer from '../../utils/getStunTimer';
import getDeathTimer from '../../utils/getDeathTimer';
import './index.css';

function AutoPlanControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    data,
    autoPlan,
    paused,
  } = pockestState;
  const stunTimer = React.useMemo(() => getStunTimer(pockestState), [pockestState]);
  const deathTimer = React.useMemo(() => getDeathTimer(pockestState), [pockestState]);
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
            onChange={(e) => pockestDispatch(pockestPlanSettings(
              pockestState,
              { autoPlan: e.target.checked },
            ))}
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
        <a
          className="PockestText PockestText--info"
          href="https://steamcommunity.com/sharedfiles/filedetails/?id=3003515624#6460421"
          target="_blank"
          rel="noreferrer"
        >
          Plan
        </a>
        <AutoPlanSettingInput settingName="planId" required />
      </div>
      <div className="PockestLine">
        <a
          className="PockestText PockestText--info"
          href="https://steamcommunity.com/sharedfiles/filedetails/?id=3003515624#6602623"
          target="_blank"
          rel="noreferrer"
        >
          Stat Plan
        </a>
        <AutoPlanSettingInput settingName="statPlanId" />
      </div>
      <Timer
        label={ageLabel}
        timestamp={getAgeTimer(pockestState)}
      />
      <Timer
        label="Stun"
        timestamp={stunTimer}
        value={!stunTimer && data?.next_small_event ? '??' : null}
      />
      <Timer
        label="Death"
        timestamp={deathTimer}
        value={!deathTimer && data?.next_small_event ? '??' : null}
      />
    </div>
  );
}

export default AutoPlanControls;
