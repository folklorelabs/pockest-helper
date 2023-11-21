import React from 'react';
import {
  CLEAN_INTERVAL, FEED_INTERVAL, STAT_ICON, STAT_ID, pockestSettings, usePockestContext,
} from '../../contexts/PockestContext';
import { parseDurationStr } from '../../utils/parseDuration';
import getNextInterval from '../../utils/getNextInterval';
import TimerLine from './TimerLine';
import './index.css';

function Timers() {
  const [now, setNow] = React.useState(new Date());
  const { pockestState, pockestDispatch } = usePockestContext();
  const { data, feedInterval, cleanInterval } = pockestState;
  const nextFeed = React.useMemo(() => getNextInterval(
    data?.monster?.live_time,
    feedInterval,
  ), [data, feedInterval]);
  const nextClean = React.useMemo(() => {
    if (cleanInterval === 2) return new Date(data?.next_small_event_timer);
    return getNextInterval(
      data?.monster?.live_time,
      cleanInterval,
    );
  }, [data, cleanInterval]);
  const nextEvolution = React.useMemo(() => new Date(data?.next_big_event_timer), [data]);
  const nextMatch = React.useMemo(() => new Date(data?.monster?.exchange_time), [data]);
  const nextTrain = React.useMemo(() => new Date(data?.monster?.training_time), [data]);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="Timers">
      <div className="ControlsLine">
        <label className="ControlsCheck" htmlFor="PockestHelper_AutoClean">
          <input
            id="PockestHelper_AutoClean"
            className="ControlsCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoClean: e.target.checked }))}
          />
          <span className="ControlsCheck-text">Clean</span>
        </label>
        <select
          className="ControlsSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ cleanInterval: parseInt(e.target.value, 10) }));
          }}
        >
          {Object.keys(CLEAN_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {CLEAN_INTERVAL[k]}
            </option>
          ))}
        </select>
      </div>
      <TimerLine label="Next Cleaning" value={parseDurationStr(nextClean - now)} />
      <div className="ControlsLine">
        <label className="ControlsCheck" htmlFor="PockestHelper_AutoFeed">
          <input
            id="PockestHelper_AutoFeed"
            className="ControlsCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoFeed: e.target.checked }))}
          />
          <span className="ControlsCheck-text">Feed</span>
        </label>
        <select
          className="ControlsSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ feedInterval: parseInt(e.target.value, 10) }));
          }}
        >
          {Object.keys(FEED_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {FEED_INTERVAL[k]}
            </option>
          ))}
        </select>
      </div>
      <TimerLine label="Next Feeding" value={parseDurationStr(nextFeed - now)} />
      <div className="ControlsLine">
        <label className="ControlsCheck" htmlFor="PockestHelper_AutoTrain">
          <input
            id="PockestHelper_AutoTrain"
            className="ControlsCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoTrain: e.target.checked }))}
          />
          <span className="ControlsCheck-text">Train</span>
        </label>
        <select
          className="ControlsSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ stat: parseInt(e.target.value, 10) }));
          }}
        >
          {Object.keys(STAT_ID).map((s) => (
            <option key={s} value={s}>
              {STAT_ICON[s]}
              {' '}
              {STAT_ID[s]}
              {' ('}
              {data?.monster?.[STAT_ID[s]]}
              )
            </option>
          ))}
        </select>
      </div>
      <TimerLine label="Next Training" value={parseDurationStr(nextTrain - now)} />
      <TimerLine label="Next Match" value={parseDurationStr(nextMatch - now)} />
      <TimerLine label="Next Evolution" value={parseDurationStr(nextEvolution - now)} />
    </div>
  );
}

export default Timers;
