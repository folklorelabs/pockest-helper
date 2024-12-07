import PockestState from '../contexts/PockestContext/types/PockestState';
import getStomachTimer, { STOMACH_TIME } from './getStomachTimer';

export default function getStomachEmptyTimer(pockestState: PockestState) {
  const stomachTimer = getStomachTimer(pockestState);
  if (!stomachTimer) return null;
  const stomach = pockestState?.data?.monster?.stomach;
  if (stomach === 0) return stomachTimer - STOMACH_TIME;
  const stomachFullCount = stomach ? Math.max(0, stomach - 1) : 0;
  const stomachFullTimerDiff = stomachFullCount * STOMACH_TIME;
  return stomachTimer + stomachFullTimerDiff;
}
