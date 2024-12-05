import MONSTER_AGE from '../config/MONSTER_AGE';

export default function getAgeTimer(pockestState) {
  if (!pockestState?.data?.monster?.live_time || !pockestState?.data?.monster?.age) return null;
  return pockestState.data.monster.live_time + MONSTER_AGE[pockestState.data.monster.age + 1];
}
