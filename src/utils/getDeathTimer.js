import getAgeTimer from './getAgeTimer';
import getStunTimer from './getStunTimer';

export const STUN_DEATH_OFFSET = (6 * 60 * 60 * 1000);

export default function getDeathTimer(pockestState) {
  const stunTimer = getStunTimer(pockestState);
  if (!stunTimer) return null;
  const deathTimer = getStunTimer(pockestState) + STUN_DEATH_OFFSET;
  const ageTimer = getAgeTimer(pockestState);
  if (pockestState?.data?.monster?.age === 5 && deathTimer > ageTimer) return null;
  return deathTimer;
}
