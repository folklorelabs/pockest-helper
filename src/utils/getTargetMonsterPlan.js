import { STAT_ABBR } from '../config/stats';
import { LEGACY_EGG_IDS } from '../config/eggs';
import ROUTES from '../config/routes';

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

const LEGACY_PLAN_REGEX = /^([W|G|Y|B|R|L])([1-6])([A|B|C][L|R])([T|S|P])$/;
const PLAN_REGEX = /^(\d*)([A|B|C][L|R])([T|S|P])([1-6])$/;

export function parsePlanId(planId) {
  const isLegacy = LEGACY_PLAN_REGEX.test(planId);
  const planIdSplit = isLegacy ? LEGACY_PLAN_REGEX.exec(planId)
    : PLAN_REGEX.exec(planId);
  if (!planIdSplit) return null;
  const planEggString = isLegacy ? `${LEGACY_EGG_IDS.indexOf(planIdSplit[1])}` : planIdSplit[1];
  const primaryStatLetter = isLegacy ? planIdSplit[4] : planIdSplit[3];
  const routeId = isLegacy ? planIdSplit[3] : planIdSplit[2];
  const planAgeString = isLegacy ? planIdSplit[2] : planIdSplit[4];
  return {
    planId: `${planEggString}${routeId}${primaryStatLetter}${planAgeString}`,
    planEgg: parseInt(planEggString, 10),
    planRoute: ROUTES[routeId],
    primaryStatLetter,
    primaryStat: `${STAT_ABBR[primaryStatLetter]}`,
    planAge: parseInt(planAgeString, 10),
  };
}

export default function getTargetMonsterPlan(state) {
  const monster = state?.allMonsters?.find((m) => m.monster_id === state?.monsterId);
  const statePlanId = (() => {
    const isMonsterPlan = !!monster;
    if (!isMonsterPlan) return state?.planId ?? '';
    const id = monster?.planId ?? '';
    if (typeof state?.planAge !== 'number') return id;
    return LEGACY_PLAN_REGEX.test(id) ? `${id.substring(0, 1)}${state?.planAge}${id.substring(2)}`
      : `${id.substring(0, id.length - 1)}${state?.planAge}`;
  })();
  const {
    planId,
    planEgg,
    planRoute,
    primaryStat,
    primaryStatLetter,
    planAge,
  } = parsePlanId(statePlanId);

  const statPlanId = (() => {
    if (monster?.statPlan) return monster.statPlan;
    const fallbackStatPlanId = Array.from(new Array(6)).map(() => primaryStatLetter).join('');
    if (monster) return fallbackStatPlanId;

    // We are in new/unknown/manual mode
    if (state?.statPlanId) return state?.statPlanId;
    return fallbackStatPlanId;
  })();

  const statPlan = statPlanId.split('').map((statLetter) => STAT_ABBR[statLetter]);

  const planDiv1 = planRoute[0] ? {
    startTime: 0,
    endTime: PLAN_TIMES[0] - 1000,
    ...PLAN_DEFAULTS,
    ...planRoute[0],
  } : null;
  const planDiv2 = planRoute[1] ? {
    startTime: PLAN_TIMES[0],
    endTime: PLAN_TIMES[1] - 1000,
    ...PLAN_DEFAULTS,
    ...planRoute[1],
  } : null;
  const planDiv3 = planRoute[2] ? {
    startTime: PLAN_TIMES[1],
    endTime: PLAN_TIMES[2] - 1000,
    ...PLAN_DEFAULTS,
    ...planRoute[2],
  } : null;

  return {
    planId,
    primaryStat,
    statPlanId,
    statPlan,
    planEgg,
    planAge,
    planDiv1,
    planDiv2,
    planDiv3,
  };
}

export function getCurrentTargetMonsterPlan(state) {
  const targetPlan = getTargetMonsterPlan(state);
  const targetPlanSpecs = (() => {
    if (state?.data?.monster?.age < 3) {
      return targetPlan?.planDiv1;
    }
    if (state?.data?.monster?.age < 4) {
      return targetPlan?.planDiv2;
    }
    return targetPlan?.planDiv3;
  })();
  const stat = (() => {
    const curTrainings = state?.log?.filter((entry) => entry.timestamp > state?.data?.monster?.live_time && entry.logType === 'training');
    const numTrains = Math.max(state?.statLog?.length, curTrainings?.length);
    return targetPlan?.statPlan?.[numTrains] || targetPlan?.primaryStat;
  })();
  return {
    monsterId: state?.monsterId,
    planId: targetPlan?.planId,
    statPlanId: targetPlan?.statPlanId,
    planAge: targetPlan?.planAge,
    stat,
    cleanOffset: targetPlanSpecs?.cleanOffset,
    feedOffset: targetPlanSpecs?.feedOffset,
    cleanFrequency: targetPlanSpecs?.cleanFrequency,
    feedFrequency: targetPlanSpecs?.feedFrequency,
    feedTarget: targetPlanSpecs?.feedTarget,
  };
}
