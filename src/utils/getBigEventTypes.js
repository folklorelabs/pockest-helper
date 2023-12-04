import getAgeTimer from './getAgeTimer';
import getStomachTimer, { STOMACH_TIME } from './getStomachTimer';
import getGarbageTimer, { GARBAGE_TIME } from './getGarbageTimer';

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
export const DEATH_OFFSET = (7 * 60 * 60 * 1000);

export function getPoopFullTimer(pockestState) {
  const garbageTimer = getGarbageTimer(pockestState);
  if (!garbageTimer) return null;
  const garbage = pockestState?.data?.monster?.garbage;
  const garbageLeftFromSmall = Math.max(0, 12 - garbage - 1);
  const poopTimerDiff = garbageLeftFromSmall * GARBAGE_TIME;
  return garbageTimer + poopTimerDiff;
}

export function getStomachEmptyTimer(pockestState) {
  const stomachTimer = getStomachTimer(pockestState);
  if (!stomachTimer) return null;
  const stomach = pockestState?.data?.monster?.stomach;
  const stomachFullCount = Math.max(0, stomach - 1);
  const stomachFullTimerDiff = stomachFullCount * STOMACH_TIME;
  return stomachTimer + stomachFullTimerDiff;
}

export function getBigEventTypes(pockestState) {
  const returnVal = [];
  const bigTimer = pockestState?.data?.next_big_event_timer;
  const ageTimer = getAgeTimer(pockestState);
  const poopFullTimer = getPoopFullTimer(pockestState);
  const poopStunTimer = poopFullTimer ? poopFullTimer + STUN_OFFSET : null;
  const poopDeathTimer = poopFullTimer ? poopFullTimer + DEATH_OFFSET : null;
  const stomachEmptyTimer = getStomachEmptyTimer(pockestState);
  const stomachStunTimer = stomachEmptyTimer ? stomachEmptyTimer + STUN_OFFSET : null;
  const stomachDeathTimer = stomachEmptyTimer ? stomachEmptyTimer + DEATH_OFFSET : null;
  if (ageTimer === bigTimer) returnVal.push(BIG_EVENTS.AGE);
  if (poopFullTimer === bigTimer) returnVal.push(BIG_EVENTS.GARBAGE_FULL);
  if (poopStunTimer === bigTimer) returnVal.push(BIG_EVENTS.GARBAGE_STUN);
  if (poopDeathTimer === bigTimer) returnVal.push(BIG_EVENTS.GARBAGE_DEATH);
  if (stomachEmptyTimer === bigTimer) returnVal.push(BIG_EVENTS.STOMACH_EMPTY);
  if (stomachStunTimer === bigTimer) returnVal.push(BIG_EVENTS.STOMACH_STUN);
  if (stomachDeathTimer === bigTimer) returnVal.push(BIG_EVENTS.STOMACH_DEATH);
  return returnVal;
}
