import React from 'react';
import cx from 'classnames';
import { pockestPause, usePockestContext } from '../../contexts/PockestContext';
import './index.css';

function PauseBtn() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const { paused } = pockestState;
  const canHelp = pockestState?.data?.monster?.age;
  return (
    <button
      className={cx('PockestButton', 'PauseBtn', paused ? 'PockestButton--off' : 'PockestButton--on')}
      type="button"
      onClick={() => pockestDispatch(pockestPause(!paused))}
      disabled={!canHelp}
    >
      <span className="PauseBtnTxt">
        Auto-Care
      </span>
    </button>
  );
}

export default PauseBtn;
