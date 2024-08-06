import { STAT_ABBR } from '../config/stats';
import daysToMs from './daysToMs';
import { parsePlanId, LEGACY_PLAN_REGEX } from './parsePlanId';

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
  } = parsePlanId(statePlanId) ?? {};

  const statPlanId = (() => {
    if (monster?.statPlan) return monster.statPlan;
    const fallbackStatPlanId = Array.from(new Array(6)).map(() => primaryStatLetter).join('');
    if (monster) return fallbackStatPlanId;

    // We are in new/unknown/manual mode
    if (state?.statPlanId) return state?.statPlanId;
    return fallbackStatPlanId;
  })();

  const statPlan = statPlanId.split('').map((statLetter) => STAT_ABBR[statLetter]);

  const planDiv1 = planRoute?.[0] ? {
    ...planRoute[0],
    startTime: 0,
    endTime: daysToMs(0.5) - 1000, // -1s so we don't trigger another event
  } : null;
  const planDiv2 = planRoute?.[1] ? {
    ...planRoute[1],
    startTime: daysToMs(0.5),
    endTime: daysToMs(1.5) - 1000, // -1s so we don't trigger another event
  } : null;
  const planDiv3 = planRoute?.[2] ? {
    ...planRoute[2],
    startTime: daysToMs(1.5),
    endTime: daysToMs(7) - 1000, // -1s so we don't trigger another event
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
