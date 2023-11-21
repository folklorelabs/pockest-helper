import React from 'react';
import {
  STAT_ICON,
  STAT_ID,
  FEED_INTERVAL,
  CLEAN_INTERVAL,
  pockestSettings,
  pockestMode,
  usePockestContext,
} from '../../contexts/PockestContext';
import Timer from '../Timer';
import useNextFeed from '../../hooks/useNextFeed';
import useNextClean from '../../hooks/useNextClean';
import './index.css';

function Controls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const nextFeed = useNextFeed();
  const nextClean = useNextClean();
  const {
    data,
    autoClean,
    autoFeed,
    autoTrain,
    cleanFrequency,
    feedFrequency,
    stat,
  } = pockestState;
  if (!data || !data.monster) return '';
  return (
    <div className="Controls">
      <Timer label={`Age ${data?.monster?.age}`} timestamp={data?.next_big_event_timer} />
      <div className="ControlsLine">
        <label className="ControlsCheck" htmlFor="PockestHelper_AutoClean">
          <input
            id="PockestHelper_AutoClean"
            className="ControlsCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoClean: e.target.checked }))}
            defaultChecked={autoClean}
          />
          <span className="ControlsCheck-text">Clean</span>
        </label>
        <select
          className="ControlsSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ cleanFrequency: parseInt(e.target.value, 10) }));
          }}
          defaultValue={cleanFrequency}
        >
          {Object.keys(CLEAN_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {CLEAN_INTERVAL[k]}
            </option>
          ))}
        </select>
      </div>
      <Timer label="Next Cleaning" timestamp={nextClean} />
      <div className="ControlsLine">
        <label className="ControlsCheck" htmlFor="PockestHelper_AutoFeed">
          <input
            id="PockestHelper_AutoFeed"
            className="ControlsCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoFeed: e.target.checked }))}
            defaultChecked={autoFeed}
          />
          <span className="ControlsCheck-text">Feed</span>
        </label>
        <select
          className="ControlsSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ feedFrequency: parseInt(e.target.value, 10) }));
          }}
          defaultValue={feedFrequency}
        >
          {Object.keys(FEED_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {FEED_INTERVAL[k]}
            </option>
          ))}
        </select>
      </div>
      <Timer label="Next Feeding" timestamp={nextFeed} />
      <div className="ControlsLine">
        <label className="ControlsCheck" htmlFor="PockestHelper_AutoTrain">
          <input
            id="PockestHelper_AutoTrain"
            className="ControlsCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoTrain: e.target.checked }))}
            defaultChecked={autoTrain}
          />
          <span className="ControlsCheck-text">Train</span>
        </label>
        <select
          className="ControlsSelect"
          defaultValue={stat}
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
      <Timer label="Next Training" timestamp={data?.monster?.training_time} />
      <Timer label="Next Match" timestamp={data?.monster?.exchange_time} />
      {/* <button
        className="ControlsButton ControlsButton--side"
        type="button"
        onClick={() => pockestDispatch(pockestMode('simple'))}
      >
        Manual Care
      </button> */}
    </div>
  );
}

export default Controls;
