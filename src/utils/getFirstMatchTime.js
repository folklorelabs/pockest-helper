import { MONSTER_LIFESPAN } from './getAgeTimer';

const OPTIMAL_MATCH_TIME = MONSTER_LIFESPAN[3];

export default function getFirstMatchTime(pockestState) {
  const monster = pockestState?.data?.monster;
  if (!monster) return null;
  if (!pockestState?.autoPlan) return 0;

  // figure out optimal first matchtime and latest of next avail or that
  const firstMatch = monster.live_time + OPTIMAL_MATCH_TIME;
  return firstMatch;
}
