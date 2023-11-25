import React from 'react';
import cx from 'classnames';
import { pockestPause, usePockestContext } from '../../contexts/PockestContext';

function PauseBtn() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const { paused } = pockestState;
  const canHelp = pockestState?.data?.monster?.age;
  return (
    <button
      className={cx('PockestButton', paused ? 'PockestButton--off' : 'PockestButton--on')}
      type="button"
      onClick={() => pockestDispatch(pockestPause(!paused))}
      disabled={!canHelp}
    >
      {paused ? 'Start Helping' : 'Helping...'}
    </button>
  );
}

export default PauseBtn;
