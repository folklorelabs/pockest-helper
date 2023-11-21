import React from 'react';
import cx from 'classnames';
import {
  STAT_ICON,
  STAT_ID,
  FEED_INTERVAL,
  CLEAN_INTERVAL,
  pockestSettings,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';

function Status() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    data,
    autoFeed,
    autoClean,
    autoTrain,
    stat,
  } = pockestState;
  return (
    <div className="Controls">
      <div className="ControlsHeader">
        <select
          className="ControlsSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ stat: parseInt(e.target.value, 10) }));
          }}
        >
          {Object.keys(STAT_ID).map((s) => (
            <option key={s} value={s}>
              {STAT_ID[s]}
              {' ('}
              {data?.monster?.[STAT_ID[s]]}
              )
            </option>
          ))}
        </select>
        <button
          type="button"
          className={cx('ControlsButton', autoTrain ? 'ControlsButton--on' : 'ControlsButton--off')}
          onClick={() => pockestDispatch(pockestSettings({ autoTrain: !autoTrain }))}
        >
          {/* {STAT_ICON[stat]}
          {' '} */}
          Auto-Train
        </button>
      </div>
      <div className="ControlsHeader">
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
        <button
          type="button"
          className={cx('ControlsButton', autoFeed ? 'ControlsButton--on' : 'ControlsButton--off')}
          onClick={() => pockestDispatch(pockestSettings({ autoFeed: !autoFeed }))}
        >
          {/* 🍎
          {' '} */}
          Auto-Feed
        </button>
      </div>
      <div className="ControlsHeader">
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
        <button
          type="button"
          className={cx('ControlsButton', autoClean ? 'ControlsButton--on' : 'ControlsButton--off')}
          onClick={() => pockestDispatch(pockestSettings({ autoClean: !autoClean }))}
        >
          {/* 🛁
          {' '} */}
          Auto-Clean
        </button>
      </div>
    </div>
  );
}

export default Status;
