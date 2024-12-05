import { STAT_ID } from '../config/stats';

export default function getTotalStats(monster) {
  return Object.keys(STAT_ID).reduce((total, k) => total + (monster?.[STAT_ID[k]] || 0), 0);
}
