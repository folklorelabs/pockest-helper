import PockestState from '../contexts/PockestContext/types/PockestState';
import getStunTimer from './getStunTimer';

export const STUN_DEATH_OFFSET = (6 * 60 * 60 * 1000);

export default function getDeathTimer(pockestState: PockestState) {
  const stunTimer = getStunTimer(pockestState);
  if (!stunTimer) return null;
  const deathTimer = stunTimer + STUN_DEATH_OFFSET;
  return deathTimer;
}
