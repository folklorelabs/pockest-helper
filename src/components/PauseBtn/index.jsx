import React from 'react';
import cx from 'classnames';
import { pockestPause, usePockestContext } from '../../contexts/PockestContext';

function PauseBtn() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const { paused } = pockestState;
  return (
    <button
      className={cx('PockestButton', paused ? 'PockestButton--off' : 'PockestButton--on')}
      type="button"
      onClick={() => pockestDispatch(pockestPause(!paused))}
    >
      {paused ? 'Start Helping' : 'Helping...'}
    </button>
  );
}

export default PauseBtn;
