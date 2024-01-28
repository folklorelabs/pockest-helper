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
  const ageTimer = React.useMemo(() => getAgeTimer(pockestState), [pockestState]);
  const stunTimer = React.useMemo(() => {
    const st = getStunTimer(pockestState);
    return st > ageTimer ? null : st;
  }, [pockestState, ageTimer]);
  const deathTimer = React.useMemo(() => {
    const dt = getDeathTimer(pockestState);
    return dt > ageTimer ? null : dt;
  }, [pockestState, ageTimer]);
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
        <div className="PockestText">
          Plan
          <a
            className="PockestToolTip"
            href="https://steamcommunity.com/sharedfiles/filedetails/?id=3003515624#6460421"
            target="_blank"
            rel="noreferrer"
          >
            ℹ️
            <span className="PockestToolTip-text">
              <em>Plans</em>
              {' '}
              are unique paths through the evolution tree and are made up of 5 letters.
              <br />
              <br />
              <em>Egg:</em>
              {' '}
              W, G, Y, B, R
              <br />
              <em>Age:</em>
              {' '}
              5
              <br />
              <em>1st Divergence:</em>
              {' '}
              A, B, C
              <br />
              <em>2nd Divergence:</em>
              {' '}
              R, L
              <br />
              <em>Primary Stat:</em>
              {' '}
              P, S, T
              <br />
              <br />
              <em>Example:</em>
              {' '}
              G5ART
              <br />
              Green egg taking the AR path all the way
              through age 5 with Technique as a primary stat.
            </span>
          </a>
        </div>
        <AutoPlanSettingInput settingName="planId" required />
      </div>
      <div className="PockestLine">
        <div className="PockestText">
          Stat Plan
          <a
            className="PockestToolTip"
            href="https://steamcommunity.com/sharedfiles/filedetails/?id=3003515624#6602623"
            target="_blank"
            rel="noreferrer"
          >
            ℹ️
            <span className="PockestToolTip-text">
              <em>Stat Plans</em>
              {' '}
              are training schedules made up of 0-14 letters.
              Each letter represents a training period with a specified stat.
              The Plan&apos;s Primary Stat is trained for unspecified periods.
              <br />
              <br />
              <em>Training Period (0-14):</em>
              {' '}
              P, S, T
              <br />
              <br />
              <em>Example:</em>
              {' '}
              SSPPTT
              <br />
              0d 00:00: Speed
              <br />
              0d 00:12: Speed
              <br />
              1d 00:00: Power
              <br />
              1d 12:00: Power
              <br />
              2d 00:00: Technique
              <br />
              2d 12:00: Technique
              <br />
              3d - 7d: Primary Stat
            </span>
          </a>
        </div>
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
