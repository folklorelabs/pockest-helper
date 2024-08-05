import React from 'react';
import fetchAllEggs from '../utils/fetchAllEggs';
import getTargetMonsterPlan from '../utils/getTargetMonsterPlan';

function usePlanEgg(pockestState) {
  const [eggData, setEggData] = React.useState();
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
    const targetPlan = getTargetMonsterPlan(pockestState);
    const egg = eggData?.eggs?.find((e) => e?.id === targetPlan?.planEgg);
    return egg;
  }, [eggData, pockestState]);
  const returnVal = React.useMemo(() => {
    const planEggCost = planEgg?.unlock ? 0 : planEgg?.buckler_point;
    return {
      planEgg,
      planEggCost,
      planEggAffordable: planEggCost <= eggData?.user_buckler_point,
      userBucklerPointBalance: eggData?.user_buckler_point,
    };
  }, [eggData, planEgg]);
  return returnVal;
}

export default usePlanEgg;
