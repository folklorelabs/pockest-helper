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

function Controls() {
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
    <div className="Controls">
      <div className="PockestLine">
        <span className="PockestText">Clean Frequency</span>
        <select
          className="PockestSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ cleanFrequency: parseInt(e.target.value, 10) }));
          }}
          defaultValue={cleanFrequency}
          disabled={!paused}
        >
          {Object.keys(CLEAN_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {CLEAN_INTERVAL[k]}
            </option>
          ))}
        </select>
      </div>
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoClean">
          <input
            id="PockestHelper_AutoClean"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoClean: e.target.checked }))}
            defaultChecked={autoClean}
            disabled={!paused}
          />
          <span className="PockestCheck-text">{currentCleanWindow || cleanFrequency === 2 ? 'Cleaning' : 'Clean'}</span>
        </label>
        <span className="PockestText">
          {(() => {
            if (cleanFrequency === 2) return '∞';
            if (!cleanEventTime) return '--';
            return parseDurationStr(cleanEventTime - now.getTime());
          })()}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Feed Frequency</span>
        <select
          className="PockestSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ feedFrequency: parseInt(e.target.value, 10) }));
          }}
          defaultValue={feedFrequency}
          disabled={!paused}
        >
          {Object.keys(FEED_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {FEED_INTERVAL[k]}
            </option>
          ))}
        </select>
      </div>
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoFeed">
          <input
            id="PockestHelper_AutoFeed"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoFeed: e.target.checked }))}
            defaultChecked={autoFeed}
            disabled={!paused}
          />
          <span className="PockestCheck-text">{currentFeedWindow || feedFrequency === 4 ? `Feeding (${feedTarget} max)` : 'Feed'}</span>
        </label>
        <span className="PockestText">
          {(() => {
            if (feedFrequency === 4) return '∞';
            if (!feedEventTime) return '--';
            return parseDurationStr(feedEventTime - now.getTime());
          })()}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Train Stat</span>
        <select
          className="PockestSelect"
          defaultValue={stat}
          onChange={(e) => {
            pockestDispatch(pockestSettings({ stat: parseInt(e.target.value, 10) }));
          }}
          disabled={!paused}
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
        <label className="PockestCheck" htmlFor="PockestHelper_AutoTrain">
          <input
            id="PockestHelper_AutoTrain"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoTrain: e.target.checked }))}
            defaultChecked={autoTrain}
            disabled={!paused}
          />
          <span className="PockestCheck-text">Train</span>
        </label>
        <span className="PockestText">{data?.monster?.training_time ? parseDurationStr(data.monster.training_time - now) : '--'}</span>
      </div>
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoMatch1">
          <input
            id="PockestHelper_AutoMatch1"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoMatch: e.target.checked }))}
            defaultChecked={autoMatch}
            disabled={!paused}
          />
          <span className="PockestCheck-text">Match</span>
        </label>
        <span className="PockestText">
          {data?.monster?.exchange_time ? parseDurationStr(data.monster.exchange_time - now.getTime()) : '--'}
        </span>
      </div>
      <Timer label="Poop/Hunger" timestamp={data?.next_small_event_timer} />
      <Timer label={`Age ${data?.monster?.age ? data.monster.age + 1 : 0}`} timestamp={data?.next_big_event_timer} />
    </div>
  );
}

export default Controls;
