import React from 'react';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import AutoPlanSettingInput from '../AutoPlanSettingInput';
import TargetAgeSelect from '../TargetAgeSelect';

function AutoPlanControlsSimple() {
  const {
    pockestState,
  } = usePockestContext();
  return (
    <div className="AutoPlanControls AutoPlanControls--simple">
      <div className="PockestLine">
        <span className="PockestText">Target</span>
        <TargetMonsterSelect disabled={pockestState?.data?.monster?.live_time ? true : null} />
      </div>
      {pockestState?.monsterId !== -1 ? '' : (
        <>
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
                  <em>Egg Generation:</em>
                  {' '}
                  1, 2, 3, 4, 5, ...
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
                  <em>Age:</em>
                  {' '}
                  1, 2, 3, 4, 5, 6
                  <br />
                  <br />
                  <em>Example:</em>
                  {' '}
                  2ART5
                  <br />
                  Green Polka-dot egg taking the AR path all the way
                  through age 5 with Technique as a primary stat.
                </span>
              </a>
            </div>
            <AutoPlanSettingInput
              settingName="planId"
              required
              disabled={pockestState?.data?.monster?.live_time ? true : null}
            />
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
                  0d 12:00: Speed
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
            <AutoPlanSettingInput
              settingName="statPlanId"
              disabled={pockestState?.data?.monster?.live_time ? true : null}
            />
          </div>
        </>
      )}
      <div className="PockestLine">
        <span className="PockestText">Target Age</span>
        <TargetAgeSelect disabled={pockestState?.data?.monster?.live_time ? true : null} />
      </div>
    </div>
  );
}

export default AutoPlanControlsSimple;
