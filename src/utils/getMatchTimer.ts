import PockestState from '../contexts/PockestContext/types/PockestState';
import getFirstMatchTime from './getFirstMatchTime';

const TRAINING_THRESHOLD = 1000 * 60 * 60;

export default function getMatchTimer(pockestState: PockestState) {
  const monster = pockestState?.data?.monster;
  if (!monster) return null;
  const nextAvailableMatch = monster.exchange_time;
  if (!pockestState?.autoPlan) return nextAvailableMatch;

  // if we are past our target age then yolo
  if (pockestState?.planAge <= monster?.age) return nextAvailableMatch;

  // figure out optimal first matchtime and latest of next avail or that
  const firstMatch = getFirstMatchTime(pockestState);
  const nextOptimalMatch = firstMatch ? Math.max(firstMatch, nextAvailableMatch) : nextAvailableMatch;

  // adjust for training time (we don't want to match right before we can train)
  return monster.training_time - nextOptimalMatch <= TRAINING_THRESHOLD
    ? Math.max(monster.training_time, nextOptimalMatch)
    : nextOptimalMatch;
}
