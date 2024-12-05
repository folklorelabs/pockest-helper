import MONSTER_AGE from '../constants/MONSTER_AGE';
import PockestState from '../contexts/PockestContext/types/PockestState';

const OPTIMAL_MATCH_TIME = MONSTER_AGE[4]; // start matching at age 4

export default function getFirstMatchTime(pockestState: PockestState) {
  const monster = pockestState?.data?.monster;
  if (!monster) return null;
  if (!pockestState?.autoPlan) return 0;

  // figure out optimal first matchtime and latest of next avail or that
  const firstMatch = monster.live_time + OPTIMAL_MATCH_TIME;
  return firstMatch;
}
