import { MONSTER_LIFESPAN } from './getAgeTimer';

export const OPTIMAL_MATCH_TIME = MONSTER_LIFESPAN[3];
export const TRAINING_THRESHOLD = 1000 * 60 * 60;

export default function getMatchTimer(pockestState) {
  const monster = pockestState?.data?.monster;
  if (!monster) return null;
  const nextAvailableMatch = monster.exchange_time;
  if (!pockestState?.autoPlan) return nextAvailableMatch;
  return Math.max(
    monster.live_time + OPTIMAL_MATCH_TIME,
    monster.training_time,
    nextAvailableMatch,
  );
}
