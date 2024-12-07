import React from 'react';
import {
  pockestActions,
  usePockestContext,
} from '../../contexts/PockestContext';
import { STAT_ID } from '../../constants/stats';
import Timer from '../Timer';
import LogCountLine from '../LogCountLine';
import getAgeTimer from '../../utils/getAgeTimer';
import './index.css';

function TrainControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const ageTimer = React.useMemo(() => getAgeTimer(pockestState), [pockestState]);
  const trainingTimer = React.useMemo(() => {
    const timer = pockestState?.data?.monster?.training_time;
    if (typeof timer !== 'number' || typeof ageTimer !== 'number' || typeof pockestState?.data?.monster?.age !== 'number') return null;
    return timer > ageTimer && pockestState?.data?.monster?.age >= 5 ? null : timer;
  }, [pockestState, ageTimer]);

  const {
    data,
    autoPlan,
    autoTrain,
    stat,
    paused,
  } = pockestState;
  return (
    <div className="TrainControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoTrain">
          <input
            id="PockestHelper_AutoTrain"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch && pockestDispatch(pockestActions.pockestSettings({ autoTrain: e.target.checked }))}
            checked={autoTrain}
            disabled={!paused || autoPlan}
          />
          <span className="PockestCheck-text">Train</span>
        </label>
        {Object.keys(STAT_ID).map((k) => (
          <span key={k} className={`PockestStat PockestStat--${STAT_ID[k]}`}>
            <span className="PockestStat-label">
              {STAT_ID[k].slice(0, 1)}
            </span>
            <span className="PockestStat-value">
              {typeof data?.monster?.[STAT_ID[k] as keyof typeof data.monster] === 'number' ? data?.monster?.[STAT_ID[k] as keyof typeof data.monster] : '--'}
            </span>
          </span>
        ))}
      </div>
      <div className="PockestLine">
        <span className="PockestText">Train Stat</span>
        <select
          className="PockestSelect"
          value={stat}
          onChange={(e) => pockestDispatch && pockestDispatch(pockestActions.pockestSettings({ stat: parseInt(e.target.value, 10) }))}
          disabled={!paused || autoPlan}
        >
          {Object.keys(STAT_ID).map((s) => (
            <option key={s} value={s}>
              {STAT_ID[s]}
            </option>
          ))}
        </select>
      </div>
      <Timer label="Next Training" timestamp={trainingTimer} />
      <LogCountLine
        title="Trainings"
        logTypes={['training']}
      />
    </div>
  );
}

export default TrainControls;
