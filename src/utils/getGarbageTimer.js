import getStomachTimer from './getStomachTimer';

export const GARBAGE_TIME = (2 * 60 * 60 * 1000);

export default function getGarbageTimer(pockestState) {
  const stomachTimer = getStomachTimer(pockestState);
  const nextSmall = pockestState?.data?.next_small_event_timer;
  if (!stomachTimer || stomachTimer === nextSmall) return null;
  return nextSmall;
}
