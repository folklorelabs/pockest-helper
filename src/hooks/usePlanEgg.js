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
  const planEgg = React.useMemo(
    () => eggData?.eggs?.find((egg) => egg?.name_en?.slice(0, 1) === targetPlan?.planEgg),
    [eggData?.eggs, targetPlan?.planEgg],
  );
  const planEggCost = React.useMemo(
    () => (planEgg?.unlock ? 0 : planEgg?.buckler_point),
    [planEgg],
  );
  const planEggAffordable = React.useMemo(
    () => planEggCost <= eggData?.user_buckler_point,
    [eggData?.user_buckler_point, planEggCost],
  );
  const returnVal = React.useMemo(() => ({
    planEgg,
    planEggCost,
    planEggAffordable,
    userBucklerPointBalance: eggData?.user_buckler_point,
  }), [eggData?.user_buckler_point, planEgg, planEggAffordable, planEggCost]);
  return returnVal;
}

export default useEggs;
