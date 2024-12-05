import getGarbageTimer, { GARBAGE_TIME } from './getGarbageTimer';

export default function getGarbageFullTimer(pockestState) {
  const garbageTimer = getGarbageTimer(pockestState);
  if (!garbageTimer) return null;
  const garbage = pockestState?.data?.monster?.garbage;
  const garbageLeftFromSmall = Math.max(0, 12 - garbage - 1);
  const poopTimerDiff = garbageLeftFromSmall * GARBAGE_TIME;
  return garbageTimer + poopTimerDiff;
}
