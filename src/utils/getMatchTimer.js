import { MONSTER_LIFESPAN } from './getAgeTimer';

// add 5 min for crude way to ensure we train first
export const OPTIMAL_MATCH_TIME = MONSTER_LIFESPAN[3] + (5 * 60 * 1000);

export default function getMatchTimer(pockestState) {
  const monster = pockestState?.data?.monster;
  if (!monster) return null;
  const nextAvailableMatch = monster.exchange_time;
  if (!pockestState?.autoPlan) return nextAvailableMatch;
  const optimalMatchTime = monster.live_time + OPTIMAL_MATCH_TIME;
  return Math.max(optimalMatchTime, nextAvailableMatch);
}
