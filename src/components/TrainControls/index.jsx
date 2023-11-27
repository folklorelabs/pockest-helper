import React from 'react';
import {
  pockestSettings,
  usePockestContext,
} from '../../contexts/PockestContext';
import { STAT_ID } from '../../config/stats';
import './index.css';
import Timer from '../Timer';
import LogCountLine from '../LogCountLine';

function TrainControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    data,
    autoPlan,
    autoTrain,
    stat,
    paused,
  } = pockestState;
  const sortedStats = React.useMemo(() => {
    const availStats = Object.keys(STAT_ID);
    return availStats.sort((a, b) => {
      const aId = STAT_ID[a];
      const aV = data?.monster?.[aId];
      const bId = STAT_ID[b];
      const bV = data?.monster?.[bId];
      return bV - aV;
    });
  }, [data]);
  return (
    <div className="TrainControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoTrain">
          <input
            id="PockestHelper_AutoTrain"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoTrain: e.target.checked }))}
            checked={autoTrain}
            disabled={!paused || autoPlan}
          />
          <span className="PockestCheck-text">Train</span>
        </label>
        {sortedStats.map((k) => (
          <span key={k} className={`PockestStat PockestStat--${STAT_ID[k]}`}>
            <span className="PockestStat-label">
              {STAT_ID[k].slice(0, 1)}
            </span>
            <span className="PockestStat-value">
              {typeof data?.monster?.[STAT_ID[k]] === 'number' ? data?.monster?.[STAT_ID[k]] : '--'}
            </span>
          </span>
        ))}
      </div>
      <div className="PockestLine">
        <span className="PockestText">Train Stat</span>
        <select
          className="PockestSelect"
          value={stat}
          onChange={(e) => {
            pockestDispatch(pockestSettings({ stat: parseInt(e.target.value, 10) }));
          }}
          disabled={!paused || autoPlan}
        >
          {Object.keys(STAT_ID).map((s) => (
            <option key={s} value={s}>
              {STAT_ID[s]}
            </option>
          ))}
        </select>
      </div>
      <Timer label="Next Training" timestamp={data?.monster?.training_time} />
      <LogCountLine
        title="Trainings"
        logTypes={['training']}
      />
    </div>
  );
}

export default TrainControls;
