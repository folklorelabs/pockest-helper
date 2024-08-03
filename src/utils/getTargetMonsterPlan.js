import { STAT_ABBR } from '../config/stats';
import { parsePlanId, LEGACY_PLAN_REGEX } from './parsePlanId';

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
