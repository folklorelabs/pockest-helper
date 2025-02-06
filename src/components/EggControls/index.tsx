import cx from 'classnames';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import usePlanEgg from '../../hooks/usePlanEgg';
import AutoPlanControlsSimple from '../AutoPlanControlsSimple';
// import QueueControls from '../QueueControls';
import './index.css';

function EggControls() {
  const {
    pockestState,
  } = usePockestContext();
  const {
    planEgg,
    planEggAffordable,
    userBucklerPointBalance,
  } = usePlanEgg(pockestState);
  return (
    <div className="EggControls">
      {/* // TODO: re-enable autoQueue
      <QueueControls /> */}
      <AutoPlanControlsSimple />
      <div className="PockestLine">
        <span className="PockestText">Egg</span>
        <span className="PockestText PockestLine-value">{planEgg?.name_en ?? '--'}</span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Egg Cost</span>
        <span className={cx('PockestText PockestLine-value PockestToolTip PockestToolTip--left PockestToolTip--bottom', { 'PockestText--error': !planEggAffordable })}>
          {!planEggAffordable ? (
            <span>❗</span>
          ) : ''}
          <span className="PockestToolTip-text">
            {!planEggAffordable ? (
              <>
                You do not have enough
                {' '}
                <em>Buckler points</em>
                .
                {' '}
              </>
            ) : ''}
            Your current Buckler point balance is
            {' '}
            <em>{userBucklerPointBalance ?? 0}</em>
            .
          </span>
          {userBucklerPointBalance ?? 0}
          {' '}
          /
          {' '}
          {planEgg?.unlock ? 'free (unlocked)' : (planEgg?.buckler_point ?? 0)}
        </span>
      </div>
    </div>
  );
}

export default EggControls;
