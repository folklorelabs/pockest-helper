import getAgeTimer from './getAgeTimer';
import getGarbageFullTimer from './getGarbageFullTimer';
import getStomachEmptyTimer from './getStomachEmptyTimer';

export const BIG_EVENTS = {
  AGE: 'AGE',
  GARBAGE_FULL: 'GARBAGE_FULL',
  GARBAGE_STUN: 'GARBAGE_STUN',
  GARBAGE_DEATH: 'GARBAGE_DEATH',
  STOMACH_EMPTY: 'STOMACH_EMPTY',
  STOMACH_STUN: 'STOMACH_STUN',
  STOMACH_DEATH: 'STOMACH_DEATH',
};
export const STUN_OFFSET = (1 * 60 * 60 * 1000);

export default function getStunTimer(pockestState) {
  const bigTimer = pockestState?.data?.next_big_event_timer;
  const ageTimer = getAgeTimer(pockestState);
  if (bigTimer !== ageTimer) return bigTimer;
  const garbageFullTimer = getGarbageFullTimer(pockestState);
  const stomachEmptyTimer = getStomachEmptyTimer(pockestState);
  return Math.min(garbageFullTimer, stomachEmptyTimer) + STUN_OFFSET;
}
