import React from 'react';
import cx from 'classnames';
import { ACTIONS, usePockestContext } from '../../contexts/PockestContext';
import './index.css';

function getStatIcon(stat) {
  if (stat === 1) {
    return '🥊';
  }
  if (stat === 2) {
    return '👟';
  }
  if (stat === 3) {
    return '🪵';
  }
  return '';
}

function getStatId(stat) {
  if (stat === 1) {
    return 'power';
  }
  if (stat === 2) {
    return 'speed';
  }
  if (stat === 3) {
    return 'technic';
  }
  return '';
}

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
            pockestDispatch([ACTIONS.SETTINGS, { stat: parseInt(e.target.value, 10) }]);
          }}
        >
          {[1, 2, 3].map((s) => (
            <option key={s} value={s}>
              {getStatIcon(s)}
              {' '}
              {getStatId(s)}
              {' ('}
              {data?.monster?.[getStatId(s)]}
              )
            </option>
          ))}
        </select>
        <button
          type="button"
          className={cx('ControlsButton', autoTrain ? 'ControlsButton--on' : 'ControlsButton--off')}
          onClick={() => pockestDispatch([ACTIONS.SETTINGS, { autoTrain: !autoTrain }])}
        >
          {getStatIcon(stat)}
          {' '}
          Auto-train
        </button>
      </div>
      <div className="ControlsHeader">
        <button
          type="button"
          className={cx('ControlsButton', autoFeed ? 'ControlsButton--on' : 'ControlsButton--off')}
          onClick={() => pockestDispatch([ACTIONS.SETTINGS, { autoFeed: !autoFeed }])}
        >
          🍎
          {' '}
          Auto-feed
        </button>
        <button
          type="button"
          className={cx('ControlsButton', autoClean ? 'ControlsButton--on' : 'ControlsButton--off')}
          onClick={() => pockestDispatch([ACTIONS.SETTINGS, { autoClean: !autoClean }])}
        >
          🛁
          {' '}
          Auto-clean
        </button>
      </div>
    </div>
  );
}

export default Status;
