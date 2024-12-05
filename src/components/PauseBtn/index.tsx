import cx from 'classnames';
import { pockestActions, usePockestContext } from '../../contexts/PockestContext';
import './index.css';

function PauseBtn() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const { paused } = pockestState;
  const canHelp = pockestState?.data?.monster?.age;
  return (
    <button
      className={cx('PockestButton', 'PauseBtn', paused ? 'PockestButton--off' : 'PockestButton--on')}
      type="button"
      onClick={() => pockestDispatch && pockestDispatch(pockestActions.pockestPause(!paused))}
      disabled={!canHelp}
    >
      <span className="PauseBtnTxt">
        Auto-Care
      </span>
    </button>
  );
}

export default PauseBtn;
