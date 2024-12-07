import MONSTER_AGE from '../constants/MONSTER_AGE';
import PockestState from '../contexts/PockestContext/types/PockestState';

export default function getAgeTimer(pockestState: PockestState) {
  if (!pockestState?.data?.monster?.live_time || !pockestState?.data?.monster?.age) return null;
  return pockestState.data.monster.live_time + MONSTER_AGE[pockestState.data.monster.age + 1];
}
