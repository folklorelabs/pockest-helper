import React from 'react';
import { pockestLoading, pockestSelectEgg, usePockestContext } from '../../contexts/PockestContext';
import useEggs from '../../hooks/useEggs';
import getMonsterPlan from '../../utils/getTargetMonsterPlan';

function BuyEggBtn() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const allEggs = useEggs();
  const targetPlan = React.useMemo(() => getMonsterPlan(pockestState), [pockestState]);
  const planEgg = React.useMemo(
    () => allEggs.find((egg) => egg?.name_en?.slice(0, 1) === targetPlan?.planEgg),
    [allEggs, targetPlan],
  );
  return (
    <button
      className="PockestButton"
      type="button"
      onClick={async () => {
        if (!planEgg?.id || pockestState?.loading) return;
        pockestDispatch(pockestLoading());
        await pockestDispatch(pockestSelectEgg(pockestState, planEgg.id));
      }}
      disabled={!planEgg?.id || pockestState?.loading}
    >
      Buy Egg
    </button>
  );
}

export default BuyEggBtn;
