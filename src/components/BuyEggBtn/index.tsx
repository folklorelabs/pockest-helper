import {
  pockestActions,
  usePockestContext,
} from '../../contexts/PockestContext';
import usePlanEgg from '../../hooks/usePlanEgg';

function BuyEggBtn() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const {
    planEgg,
    planEggAffordable,
  } = usePlanEgg(pockestState);
  return (
    <button
      className="PockestButton"
      type="button"
      onClick={async () => {
        if (!planEgg?.id || pockestState?.loading) return;
        if (pockestDispatch) pockestDispatch(pockestActions.pockestLoading());
        if (pockestDispatch) pockestDispatch(await pockestActions.pockestSelectEgg(planEgg.id));
      }}
      disabled={!planEgg?.id || pockestState?.loading || !planEggAffordable}
    >
      Buy Egg
    </button>
  );
}

export default BuyEggBtn;
