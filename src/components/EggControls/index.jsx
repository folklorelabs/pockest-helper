import React from 'react';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import useEggs from '../../hooks/useEggs';
import getMonsterPlan from '../../utils/getTargetMonsterPlan';
import './index.css';

function EggControls() {
  const {
    pockestState,
  } = usePockestContext();
  const allEggs = useEggs();
  const targetPlan = React.useMemo(() => getMonsterPlan(pockestState), [pockestState]);
  const planEgg = React.useMemo(
    () => allEggs.find((egg) => egg?.name_en?.slice(0, 1) === targetPlan?.planEgg),
    [allEggs, targetPlan],
  );
  return (
    <div className="EggControls">
      <div className="PockestLine">
        <span className="PockestText">Target</span>
        <TargetMonsterSelect />
      </div>
      <div className="PockestLine">
        <span className="PockestText">Plan</span>
        <span className="PockestText PockestLine-value">{targetPlan.planId ?? '--'}</span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Egg</span>
        <span className="PockestText PockestLine-value">{planEgg?.name_en ?? '--'}</span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Cost</span>
        <span className="PockestText PockestLine-value">
          {planEgg?.unlock ? 0 : planEgg?.buckler_point ?? '--'}
        </span>
      </div>
    </div>
  );
}

export default EggControls;
