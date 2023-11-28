import { STAT_ID } from '../config/stats';
import routes from '../config/routes';
import monsters from '../data/monsters.json';

const PLAN_DEFAULTS = {
  cleanFrequency: null,
  feedFrequency: null,
  cleanOffset: 0,
  feedOffset: 0,
  feedTarget: 6,
};

const PLAN_TIMES = [
  12 * 60 * 60 * 1000,
  36 * 60 * 60 * 1000,
  168 * 60 * 60 * 1000,
];

export default function getMonsterPlan(monsterId) {
  const monster = monsters.find((m) => m.monster_id === monsterId);
  const planId = monster?.plan;
  if (!planId) return {};

  const planEgg = planId.slice(0, 1);

  const planAge = parseInt(planId.slice(1, 2), 10);

  const routeId = planId.slice(2, 4);
  const route = routes[routeId];
  const planDiv1 = route[0] ? {
    startTime: 0,
    endTime: PLAN_TIMES[0] - 1000,
    ...PLAN_DEFAULTS,
    ...route[0],
  } : null;
  const planDiv2 = route[1] ? {
    startTime: PLAN_TIMES[0],
    endTime: PLAN_TIMES[1] - 1000,
    ...PLAN_DEFAULTS,
    ...route[1],
  } : null;
  const planDiv3 = route[2] ? {
    startTime: PLAN_TIMES[1],
    endTime: PLAN_TIMES[2] - 1000,
    ...PLAN_DEFAULTS,
    ...route[2],
  } : null;

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

export function getCurrentMonsterPlan(monsterId, age) {
  const targetPlan = getMonsterPlan(monsterId);
  const targetPlanSpecs = (() => {
    if (age < 3) {
      return targetPlan?.planDiv1;
    }
    if (age < 4) {
      return targetPlan?.planDiv2;
    }
    return targetPlan?.planDiv3;
  })();
  return {
    monsterId,
    stat: targetPlan?.planStat,
    cleanOffset: targetPlanSpecs?.cleanOffset,
    feedOffset: targetPlanSpecs?.feedOffset,
    cleanFrequency: targetPlanSpecs?.cleanFrequency,
    feedFrequency: targetPlanSpecs?.feedFrequency,
    feedTarget: targetPlanSpecs?.feedTarget,
  };
}
