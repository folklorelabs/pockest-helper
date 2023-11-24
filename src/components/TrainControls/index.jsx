import React from 'react';
import {
  pockestSettings,
  usePockestContext,
  getCurrentPlanScheduleWindows,
} from '../../contexts/PockestContext';
import { STAT_ICON, STAT_ID } from '../../data/stats';
import Timer from '../Timer';
import './index.css';
import useNow from '../../hooks/useNow';
import { parseDurationStr } from '../../utils/parseDuration';

// CONSTS
const FEED_INTERVAL = {
  4: 'Every 4h',
  12: 'Every 12h',
  24: 'Every 24h',
};

const CLEAN_INTERVAL = {
  2: 'Every 2h',
  4: 'Every 4h',
  12: 'Every 12h',
  24: 'Every 24h',
};

function TrainControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const now = useNow();
  const {
    currentCleanWindow,
    nextCleanWindow,
    currentFeedWindow,
    nextFeedWindow,
  } = React.useMemo(() => getCurrentPlanScheduleWindows(pockestState), [pockestState]);
  const {
    data,
    autoPlan,
    autoClean,
    autoFeed,
    autoTrain,
    autoMatch,
    cleanFrequency,
    feedFrequency,
    feedTarget,
    stat,
    paused,
  } = pockestState;
  const cleanEventTime = (() => {
    if (cleanFrequency === 2) return null;
    if (currentCleanWindow) return currentCleanWindow.end;
    return nextCleanWindow?.start;
  })();
  const feedEventTime = (() => {
    if (feedFrequency === 4) return null;
    if (currentFeedWindow) return currentFeedWindow.end;
    return nextFeedWindow?.start;
  })();
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
              {' '}
              {STAT_ICON[s]}
            </option>
          ))}
        </select>
      </div>
      <div className="PockestLine">
        <span className="PockestText">
          Next Match
        </span>
        <span className="PockestText">
          {data?.monster?.training_time ? parseDurationStr(data.monster.training_time - now.getTime()) : '--'}
        </span>
      </div>
    </div>
  );
}

export default TrainControls;
