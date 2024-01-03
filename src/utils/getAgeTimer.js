export const MONSTER_LIFESPAN = {
  1: 1 * 60 * 60 * 1000, // 1 hour
  2: 12 * 60 * 60 * 1000, // 12 hour
  3: 1.5 * 24 * 60 * 60 * 1000, // 1.5 days
  4: 3 * 24 * 60 * 60 * 1000, // 3 days
  5: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export default function getAgeTimer(pockestState) {
  if (!pockestState?.data?.monster?.live_time || !pockestState?.data?.monster?.age) return null;
  return pockestState.data.monster.live_time + MONSTER_LIFESPAN[pockestState.data.monster.age];
}
