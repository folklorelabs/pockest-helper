import React from 'react';
import { pockestGetters } from '../contexts/PockestContext';
import PockestState from '../contexts/PockestContext/types/PockestState';

function usePlanEgg(pockestState: PockestState) {
  const planEgg = React.useMemo(() => {
    const targetPlan = pockestGetters?.getTargetMonsterPlan(pockestState);
    const egg = pockestState?.allEggs?.find((e) => e?.id === targetPlan?.planEgg);
    return egg;
  }, [pockestState]);
  const returnVal = React.useMemo(() => {
    const planEggCost = planEgg?.unlock ? 0 : planEgg?.buckler_point;
    return {
      planEgg,
      planEggCost,
      planEggAffordable: pockestState?.allEggs && pockestState?.bucklerBalance && typeof planEggCost === 'number' && planEggCost <= pockestState?.bucklerBalance,
      userBucklerPointBalance: pockestState?.bucklerBalance || 0,
    };
  }, [pockestState?.allEggs, planEgg]);
  return returnVal;
}

export default usePlanEgg;
