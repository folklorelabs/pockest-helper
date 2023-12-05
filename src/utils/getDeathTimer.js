import getStunTimer from './getStunTimer';

export const STUN_DEATH_OFFSET = (6 * 60 * 60 * 1000);

export default function getDeathTimer(pockestState) {
  return getStunTimer(pockestState) + STUN_DEATH_OFFSET;
}
