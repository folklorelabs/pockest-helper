import { MONSTER_LIFESPAN } from './getAgeTimer';

export const OPTIMAL_MATCH_TIME = MONSTER_LIFESPAN[3];
export const TRAINING_THRESHOLD = 1000 * 60 * 60;

export default function getMatchTimer(pockestState) {
  const monster = pockestState?.data?.monster;
  if (!monster) return null;
  const nextAvailableMatch = monster.exchange_time;
  if (!pockestState?.autoPlan) return nextAvailableMatch;
  const firstMatch = monster.live_time + OPTIMAL_MATCH_TIME;
  const nextOptimalMatch = Math.max(firstMatch, nextAvailableMatch);
  return monster.training_time - nextOptimalMatch <= TRAINING_THRESHOLD
    ? Math.max(monster.training_time, nextOptimalMatch)
    : nextOptimalMatch;
}
