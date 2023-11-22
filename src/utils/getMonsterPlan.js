import { STAT_ID } from '../contexts/PockestContext';
import monsters from '../config/monsters';
import routes from '../config/routes';

export function getMonsterPlan(monsterId) {
  const monster = monsters.find((m) => m.monster_id === monsterId);
  return monster?.plan;
}

export function getPlanStat(plan) {
  if (!plan) return null;
  const statLetter = plan?.slice(3, 4);
  return Object.keys(STAT_ID).find((k) => STAT_ID[k].slice(0, 1).toUpperCase() === statLetter);
}

export function getPlanRoute(plan, age) {
  if (age < 4) {
    const divergence = plan?.slice(1, 2);
    if (divergence === 'C') return routes.right;
    if (divergence === 'B') return routes.mid;
    return routes.left;
  }
  if (age < 5) {
    const divergence = plan?.slice(2, 3);
    if (divergence === 'R') return routes.right;
    return routes.left;
  }
  return routes.left;
}
