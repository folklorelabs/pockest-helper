import { STAT_ID } from '../data/stats';
import monsters from '../data/monsters';
import routes from '../data/routes';

export default function getMonsterPlan(monsterId) {
  const monster = monsters.find((m) => m.monster_id === monsterId);
  const planId = monster?.plan;
  if (!planId) return {};

  const planEgg = planId.slice(0, 1);

  const planAge = parseInt(planId.slice(1, 2), 10);

  const div1 = planId.slice(2, 3);
  const planDiv1 = routes[div1];
  const div2 = planId.slice(3, 4);
  const planDiv2 = routes[div2];
  const planDiv3 = routes.L;

  const statLetter = planId.slice(4, 5);
  const planStat = Object.keys(STAT_ID)
    .find((k) => STAT_ID[k].slice(0, 1).toUpperCase() === statLetter);

  return {
    planId,
    planEgg,
    planAge,
    planDiv1,
    planDiv2,
    planDiv3,
    planStat,
  };
}
