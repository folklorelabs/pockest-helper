import PockestState from '../contexts/PockestContext/types/PockestState';
import getGarbageTimer, { GARBAGE_TIME } from './getGarbageTimer';

export default function getGarbageFullTimer(pockestState: PockestState) {
  const garbageTimer = getGarbageTimer(pockestState);
  if (!garbageTimer) return null;
  const garbage = pockestState?.data?.monster?.garbage;
  const garbageLeftFromSmall = typeof garbage === 'number' ? Math.max(0, 12 - garbage - 1) : 0;
  const poopTimerDiff = garbageLeftFromSmall * GARBAGE_TIME;
  return garbageTimer + poopTimerDiff;
}
