import React from 'react';
import {
  STAT_ICON,
  STAT_ID,
  FEED_INTERVAL,
  CLEAN_INTERVAL,
  pockestSettings,
  usePockestContext,
  getCurrentPlanTimes,
  getCurrentPlanScheduleWindows,
} from '../../contexts/PockestContext';
import Timer from '../Timer';
import './index.css';
import useNow from '../../hooks/useNow';
import { parseDurationStr } from '../../utils/parseDuration';

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
    cleanFrequency,
    feedFrequency,
    stat,
    paused,
  } = pockestState;
  if (!data || !data.monster) return '';
  const cleanEventTime = (() => {
    if (cleanFrequency === 2) return null;
    if (currentCleanWindow) return currentCleanWindow.end;
    return nextCleanWindow.start;
  })();
  const feedEventTime = (() => {
    if (feedFrequency === 4) return null;
    if (currentFeedWindow) return currentFeedWindow.end;
    return nextFeedWindow.start;
  })();
  return (
    <div className="Controls">
      <Timer label={`Age ${data?.monster?.age ? data.monster.age + 1 : 0}`} timestamp={data?.next_big_event_timer} />
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
        <span className="PockestText">{cleanFrequency === 2 ? '∞' : parseDurationStr(cleanEventTime - now.getTime())}</span>
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
          <span className="PockestCheck-text">{currentFeedWindow || feedFrequency === 4 ? 'Feeding' : 'Feed'}</span>
        </label>
        <span className="PockestText">{feedFrequency === 4 ? '∞' : parseDurationStr(feedEventTime - now.getTime())}</span>
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
        <span className="PockestText">{parseDurationStr(data?.monster?.training_time ? data.monster.training_time - now : 0)}</span>
      </div>
      <Timer label="Next Match" timestamp={data?.monster?.exchange_time} />
    </div>
  );
}

export default Controls;
