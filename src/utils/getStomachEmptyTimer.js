import getStomachTimer, { STOMACH_TIME } from './getStomachTimer';

export default function getStomachEmptyTimer(pockestState) {
  const stomachTimer = getStomachTimer(pockestState);
  if (!stomachTimer) return null;
  const stomach = pockestState?.data?.monster?.stomach;
  const stomachFullCount = Math.max(0, stomach - 1);
  const stomachFullTimerDiff = stomachFullCount * STOMACH_TIME;
  return stomachTimer + stomachFullTimerDiff;
}
