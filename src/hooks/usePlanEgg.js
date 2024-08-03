import React from 'react';
import fetchAllEggs from '../utils/fetchAllEggs';
import getTargetMonsterPlan from '../utils/getTargetMonsterPlan';

function useEggs(pockestState) {
  const [eggData, setEggData] = React.useState({});
  React.useEffect(() => {
    (async () => {
      const res = await fetchAllEggs();
      setEggData({
        eggs: res?.eggs,
        user_buckler_point: res?.user_buckler_point,
      });
    })();
  }, []);
  const targetPlan = React.useMemo(() => getTargetMonsterPlan(pockestState), [pockestState]);
  const planEggCost = React.useMemo(
    () => (targetPlan?.planEgg?.unlock ? 0 : targetPlan?.planEgg?.buckler_point),
    [targetPlan?.planEgg],
  );
  const planEggAffordable = React.useMemo(
    () => planEggCost <= eggData?.user_buckler_point,
    [eggData?.user_buckler_point, planEggCost],
  );
  const returnVal = React.useMemo(() => ({
    planEgg: targetPlan?.planEgg,
    planEggCost,
    planEggAffordable,
    userBucklerPointBalance: eggData?.user_buckler_point,
  }), [eggData?.user_buckler_point, planEggAffordable, planEggCost, targetPlan?.planEgg]);
  return returnVal;
}

export default useEggs;
