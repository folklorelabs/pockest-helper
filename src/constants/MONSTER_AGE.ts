const MONSTER_AGE: Record<number, number> = {
  1: 0,
  2: 1 * 60 * 60 * 1000, // 1 hour
  3: 12 * 60 * 60 * 1000, // 12 hour
  4: 1.5 * 24 * 60 * 60 * 1000, // 1.5 days
  5: 3 * 24 * 60 * 60 * 1000, // 3 days
  6: 7 * 24 * 60 * 60 * 1000, // 7 days
};
export default MONSTER_AGE;
