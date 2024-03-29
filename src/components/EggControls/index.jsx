import React from 'react';
import cx from 'classnames';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import usePlanEgg from '../../hooks/usePlanEgg';
import './index.css';
import AutoPlanSettingInput from '../AutoPlanSettingInput';

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
      <div className="PockestLine">
        <span className="PockestText">Target</span>
        <TargetMonsterSelect />
      </div>
      <div className="PockestLine">
        <span className="PockestText">Plan</span>
        <AutoPlanSettingInput settingName="planId" />
      </div>
      <div className="PockestLine">
        <span className="PockestText">Stat Plan</span>
        <AutoPlanSettingInput settingName="statPlanId" />
      </div>
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
            You do not have enough
            {' '}
            <em>buckler points</em>
            . Your current balance is
            {' '}
            <em>{userBucklerPointBalance ?? '--'}</em>
            .
          </span>
          {planEgg?.unlock ? 0 : planEgg?.buckler_point ?? '--'}
        </span>
      </div>
    </div>
  );
}

export default EggControls;
