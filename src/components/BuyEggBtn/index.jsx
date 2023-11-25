import React from 'react';
import { pockestLoading, pockestSelectEgg, usePockestContext } from '../../contexts/PockestContext';
import getMonsterPlan from '../../utils/getMonsterPlan';

const EGG_LABEL = {
  1: 'White',
  2: 'Green',
  3: 'Yellow',
  4: 'Blue',
};

function BuyEggBtn() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const canBuyEgg = !pockestState?.data?.monster?.age
    && pockestState?.autoPlan && pockestState?.monsterId;
  const planEgg = React.useState(() => {
    const plan = getMonsterPlan(pockestState?.monsterId);
    return Object.keys(EGG_LABEL).find((id) => EGG_LABEL[id].slice(0, 1) === plan?.planEgg);
  }, [pockestState?.monsterId]);
  return (
    <button
      className="PockestButton"
      type="button"
      onClick={async () => {
        pockestDispatch(pockestLoading());
        await pockestDispatch(pockestSelectEgg(planEgg));
      }}
      disabled={!canBuyEgg || pockestState?.loading}
    >
      {`Buy ${EGG_LABEL[planEgg] || ''} Egg`}
    </button>
  );
}

export default BuyEggBtn;
