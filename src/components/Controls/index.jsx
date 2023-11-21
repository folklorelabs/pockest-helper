import React from 'react';
import {
  STAT_ICON,
  STAT_ID,
  FEED_INTERVAL,
  CLEAN_INTERVAL,
  pockestSettings,
  usePockestContext,
} from '../../contexts/PockestContext';
import Timer from '../Timer';
import useNextFeed from '../../hooks/useNextFeed';
import useNextClean from '../../hooks/useNextClean';
import './index.css';
import useNow from '../../hooks/useNow';
import { parseDurationStr } from '../../utils/parseDuration';

function Controls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const nextFeed = useNextFeed();
  const nextClean = useNextClean();
  const now = useNow();
  const {
    data,
    autoClean,
    autoFeed,
    autoTrain,
    autoPlan,
    cleanFrequency,
    feedFrequency,
    stat,
  } = pockestState;
  if (!data || !data.monster) return '';
  return (
    <div className="Controls">
      <Timer label={`Age ${data?.monster?.age ? data.monster.age + 1 : 0}`} timestamp={data?.next_big_event_timer} />
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoClean">
          <input
            id="PockestHelper_AutoClean"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoClean: e.target.checked }))}
            defaultChecked={autoClean}
          />
          <span className="PockestCheck-text">Clean</span>
        </label>
        <span className="PockestText">{parseDurationStr(nextClean - now)}</span>
      </div>
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoFeed">
          <input
            id="PockestHelper_AutoFeed"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoFeed: e.target.checked }))}
            defaultChecked={autoFeed}
          />
          <span className="PockestCheck-text">Feed</span>
        </label>
        <span className="PockestText">{parseDurationStr(nextFeed - now)}</span>
      </div>
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoTrain">
          <input
            id="PockestHelper_AutoTrain"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoTrain: e.target.checked }))}
            defaultChecked={autoTrain}
          />
          <span className="PockestCheck-text">Train</span>
        </label>
        <span className="PockestText">{parseDurationStr(data?.monster?.training_time ? data.monster.training_time - now : 0)}</span>
      </div>
      <Timer label="Next Match" timestamp={data?.monster?.exchange_time} />
      <div className="PockestLine">
        <span className="PockestText">Clean Frequency</span>
        <select
          className="PockestSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ cleanFrequency: parseInt(e.target.value, 10) }));
          }}
          defaultValue={cleanFrequency}
          disabled={autoPlan}
        >
          {Object.keys(CLEAN_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {CLEAN_INTERVAL[k]}
            </option>
          ))}
        </select>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Feed Frequency</span>
        <select
          className="PockestSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ feedFrequency: parseInt(e.target.value, 10) }));
          }}
          defaultValue={feedFrequency}
          disabled={autoPlan}
        >
          {Object.keys(FEED_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {FEED_INTERVAL[k]}
            </option>
          ))}
        </select>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Train Stat</span>
        <select
          className="PockestSelect"
          defaultValue={stat}
          onChange={(e) => {
            pockestDispatch(pockestSettings({ stat: parseInt(e.target.value, 10) }));
          }}
          disabled={autoPlan}
        >
          {Object.keys(STAT_ID).map((s) => (
            <option key={s} value={s}>
              {STAT_ICON[s]}
              {' '}
              {STAT_ID[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Controls;
