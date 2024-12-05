import React from 'react';
import { pockestGetters } from '../contexts/PockestContext';
import fetchAllEggs from '../api/fetchAllEggs';
import PockestState from '../contexts/PockestContext/types/PockestState';
import BucklerEggData from '../types/BucklerEggsData';

function usePlanEgg(pockestState: PockestState) {
  const [eggData, setEggData] = React.useState<BucklerEggData>();
  React.useEffect(() => {
    (async () => {
      const res = await fetchAllEggs();
      setEggData({
        eggs: res?.eggs,
        user_buckler_point: res?.user_buckler_point,
      });
    })();
  }, []);
  const planEgg = React.useMemo(() => {
    if (!eggData) return null;
    const targetPlan = pockestGetters?.getTargetMonsterPlan(pockestState);
    const egg = eggData?.eggs?.find((e) => e?.id === targetPlan?.planEgg);
    return egg;
  }, [eggData, pockestState]);
  const returnVal = React.useMemo(() => {
    const planEggCost = planEgg?.unlock ? 0 : planEgg?.buckler_point;
    return {
      planEgg,
      planEggCost,
      planEggAffordable: eggData && typeof planEggCost === 'number' && planEggCost <= eggData?.user_buckler_point,
      userBucklerPointBalance: eggData?.user_buckler_point || 0,
    };
  }, [eggData, planEgg]);
  return returnVal;
}

export default usePlanEgg;
