import { STAT_ABBR, STAT_ID_ABBR } from '../../constants/stats';
import MONSTER_AGE from '../../constants/MONSTER_AGE';
import getTimeIntervals, { TimeInterval } from '../../utils/getTimeIntervals';
import getTotalStats from '../../utils/getTotalStats';
import getDeathTimer, { STUN_DEATH_OFFSET } from '../../utils/getDeathTimer';
import { parsePlanId, LEGACY_PLAN_REGEX } from '../../utils/parsePlanId';
import daysToMs from '../../utils/daysToMs';
import getMonsterIdFromHash from '../../utils/getMonsterIdFromHash';
import getFirstMatchTime from '../../utils/getFirstMatchTime';
import toDataUrl from '../../utils/toDataUrl';
import fetchCharSprites from '../../api/fetchCharSprites';
import { GARBAGE_TIME } from '../../utils/getGarbageTimer';
import { STOMACH_TIME } from '../../utils/getStomachTimer';
import { STUN_OFFSET } from '../../utils/getStunTimer';
import PockestState from './types/PockestState';
import BucklerStatusData from '../../types/BucklerStatusData';
import Settings from './types/Settings';
import BucklerMatchResults from '../../types/BucklerMatchResults';
import BucklerPotentialMatch from '../../types/BucklerPotentialMatch';
import PlanQueueItem from './types/PlanQueueItem';
import Monster from '../../types/Monster';

export function getLogEntry(pockestState: PockestState, data?: BucklerStatusData) {
  const mergedData = data ?? pockestState?.data;
  return {
    logType: mergedData?.event,
    timestamp: new Date().getTime(),
    monsterId: mergedData?.monster?.hash ? getMonsterIdFromHash(mergedData?.monster?.hash) : -1,
    monsterBirth: mergedData?.monster?.live_time,
  };
}

export function getMonsterId(state: PockestState) {
  const hashId = state?.data?.monster?.hash;
  if (!hashId) return null;
  return parseInt(hashId.slice(0, 4), 10);
}

export function getPlanQueueItemLabel(state: PockestState, planQueueItem?: PlanQueueItem | null) {
  if (!planQueueItem) return '';
  const monster = state.allMonsters.find((m) => planQueueItem.monsterId && m.monster_id === planQueueItem.monsterId);
  const name = monster?.name_en || `${planQueueItem.planId}${planQueueItem.statPlanId ? `-${planQueueItem.statPlanId}` : ''}`;
  const planAge = planQueueItem.monsterId !== -1 ? planQueueItem.planAge : parsePlanId(planQueueItem.planId)?.planAge
  return `${name} (Age ${planAge})`;
}

export function getTargetableMonsters(state: PockestState, targetAge?: number | null) {
  const acquiredMementos = getOwnedMementoMonsterIds(state);
  return state?.allMonsters
    ?.filter((m) => {
      if (!m.confirmed) return false;
      if (m?.requiredMemento && !acquiredMementos.includes(m.requiredMemento)) return false;
      if (m.age < 5) return false;
      if (targetAge === 5 && m.unlock) return false;
      if (targetAge === 6 && m.memento_flg) return false;
      return true;
    })
    .sort((a, b) => {
      if (!a.name_en && !b.name_en) return 0;
      if (!a.name_en || a.name_en < (b.name_en ?? '')) return -1;
      if (!b.name_en || b.name_en < a.name_en) return 1;
      return 0;
    });
}

export function getCurrentTargetableMonsters(state: PockestState, targetAge: number = 6) {
  const targetableMonsters = getTargetableMonsters(state, targetAge);
  const monster = state?.data?.monster;
  const curMonsterId = getMonsterId(state);
  if (!curMonsterId) {
    return getTargetableMonsters(state);
  }
  const allAvailIds = state?.allMonsters
    ?.filter((m) => {
      const isOlder = typeof monster?.age === 'number' && m?.age > monster.age;
      return isOlder;
    })
    .reduce((all, m) => {
      // only return decendants of current monster
      const match = m.from.find((pid) => pid === curMonsterId || all.includes(pid));
      if (!match) return all;
      return [
        ...all,
        m.monster_id,
      ].filter((id) => typeof id === 'number');
    }, [curMonsterId] as number[]);
  return targetableMonsters
    ?.filter((m) => m?.monster_id && allAvailIds.includes(m?.monster_id))
    ?.filter((m) => !state?.eggId || m?.eggIds?.includes(state?.eggId));
}

export function getMonsterEgg(state: PockestState, monsterId?: number | null) {
  const monster = state?.allMonsters?.find((m) => m.monster_id === monsterId);
  if (!monster) return null;
  return state?.allEggs?.find((e) => monster.eggIds?.includes(e.id));
}

export function getPlanIdEgg(state: PockestState, planId?: string | null) {
  if (!planId) return null;
  const parsedPlanId = parsePlanId(planId);
  if (!parsedPlanId) return null;
  const { planEgg } = parsedPlanId;
  return state?.allEggs?.find((e) => e.id === planEgg)
}

export function getAffordableMonsters(state: PockestState) {
  return state?.allMonsters?.filter((m) => {
    if (m.age < 5) return false;
    const monsterEgg = getMonsterEgg(state, m.monster_id);
    const eggPrice = monsterEgg?.buckler_point || Infinity;
    return eggPrice <= state.bucklerBalance;
  });
}

export async function getBestMatch(state: PockestState, exchangeList: BucklerPotentialMatch[]) {
  const monsterId = getMonsterId(state);
  const monster = state?.allMonsters?.find((m) => m.monster_id === monsterId);
  const sortedMatches = exchangeList?.map((a) => {
    const aMulti = monster?.matchFever?.includes(a.monster_id) ? 1.5 : 1;
    return {
      ...a,
      expectedPoints: getTotalStats(a) * aMulti,
    };
  })?.sort((a, b) => {
    if (state?.matchPriority === 0) {
      const aSusFever = monster?.matchSusFever?.includes(a.monster_id);
      const bSusFever = monster?.matchSusFever?.includes(b.monster_id);
      if (aSusFever && !bSusFever) return -1;
      if (bSusFever && !aSusFever) return 1;
      const aUnknown = monster?.matchUnknown?.includes(a.monster_id);
      const bUnknown = monster?.matchUnknown?.includes(b.monster_id);
      if (aUnknown && !bUnknown) return -1;
      if (bUnknown && !aUnknown) return 1;
      const aSusNormal = monster?.matchSusNormal?.includes(a.monster_id);
      const bSusNormal = monster?.matchSusNormal?.includes(b.monster_id);
      if (aSusNormal && !bSusNormal) return -1;
      if (bSusNormal && !aSusNormal) return 1;
    }
    if (a.expectedPoints > b.expectedPoints) return -1;
    if (a.expectedPoints < b.expectedPoints) return 1;
    return 0;
  });
  return sortedMatches?.[0];
}

export function getOwnedMementoMonsterIds(state: PockestState) {
  return state?.allMonsters
    ?.filter((m) => m?.memento_flg)
    .map((m) => m?.monster_id)
    .filter((m) => typeof m === 'number') ?? [];
}

export function getOwnedMementoMonsterNames(state: PockestState) {
  const mementosOwned = getOwnedMementoMonsterIds(state);
  return mementosOwned.map((id) => state.allMonsters
    ?.find((m) => m.monster_id === id)?.name_en);
}

export function getCurrentMonsterLogs(state: PockestState, logType?: string) {
  return state?.log.filter((entry) => {
    if (!state?.data?.monster) return false;
    if (logType && entry?.logType !== logType) return false;
    return entry.timestamp >= state?.data?.monster?.live_time;
  });
}

export function getTargetMonsterPlanId(state: PockestState) {
  const monster = state?.allMonsters?.find((m) => m.monster_id === state?.monsterId);
  const planId = (() => {
    const isMonsterPlan = !!monster;
    if (!isMonsterPlan) return state?.planId ?? '';
    const id = monster?.planId ?? '';
    if (typeof state?.planAge !== 'number') return id;
    return LEGACY_PLAN_REGEX.test(id) ? `${id.substring(0, 1)}${state?.planAge}${id.substring(2)}`
      : `${id.substring(0, id.length - 1)}${state?.planAge}`;
  })();
  return planId;
}

export function getTargetMonsterStatPlanId(state: PockestState) {
  const monster = state?.allMonsters?.find((m) => m.monster_id === state?.monsterId);
  const statePlanId = getTargetMonsterPlanId(state);
  const {
    primaryStatLetter,
  } = parsePlanId(statePlanId) ?? {};
  const statPlanId = (() => {
    if (monster?.statPlan) return monster.statPlan;
    const fallbackStatPlanId = Array.from(new Array(6)).map(() => primaryStatLetter).join('');
    if (monster) return fallbackStatPlanId;

    // We are in new/unknown/manual mode
    if (state?.statPlanId) return state?.statPlanId;
    return fallbackStatPlanId;
  })();
  return statPlanId;
}

export function getTargetMonsterPlan(state: PockestState) {
  const statePlanId = getTargetMonsterPlanId(state);
  const statPlanId = getTargetMonsterStatPlanId(state);
  const {
    planId,
    planEgg,
    planRoute,
    primaryStat,
    planAge,
  } = parsePlanId(statePlanId) ?? {};
  const statPlan = statPlanId.split('').map((statLetter) => STAT_ABBR[statLetter]);
  return {
    planId,
    primaryStat,
    statPlanId,
    statPlan,
    planEgg,
    planAge,
    planRoute,
  };
}

export function getTargetMonsterStatPlan(state: PockestState) {
  const statPlanId = getTargetMonsterStatPlanId(state);
  const statPlan = statPlanId.split('').map((statLetter) => STAT_ABBR[statLetter]);
  return {
    statPlanId,
    statPlan,
  };
}

export function getTargetMonsterCurrentRouteSpec(state: PockestState) {
  const targetPlan = getTargetMonsterPlan(state);
  if (!targetPlan) return null;
  const curAge = state?.data?.monster?.age;
  if (typeof curAge !== 'number') return null;
  const currentRouteSpec = targetPlan?.planRoute
    ?.find((r) => curAge >= r?.ageStart && curAge < r?.ageEnd);
  return currentRouteSpec;
}

export function getTargetMonsterCurrentStat(state: PockestState) {
  const targetPlan = getTargetMonsterPlan(state);
  const stat = (() => {
    if (!state?.data?.monster?.live_time) return null;
    const curTrainings = state?.log?.filter((entry) => state?.data?.monster?.live_time && entry.timestamp > state?.data?.monster?.live_time && entry.logType.includes('training'));
    const numTrains = Math.max(state?.statLog?.length, curTrainings?.length);
    const curTrainIndex = Math.floor((Date.now() - state?.data?.monster?.live_time) / (12 * 1000 * 60 * 60));
    if (numTrains > curTrainIndex) return null;
    return parseInt(targetPlan?.statPlan?.[curTrainIndex] ?? targetPlan?.primaryStat, 10);
  })();
  return stat;
}

export function getTargetMonsterNextStat(state: PockestState) {
  const targetPlan = getTargetMonsterPlan(state);
  const stat = (() => {
    if (!state?.data?.monster?.live_time) return null;
    const curTrainings = state?.log?.filter((entry) => state?.data?.monster?.live_time && entry.timestamp > state?.data?.monster?.live_time && entry.logType.includes('training'));
    const numTrains = Math.max(state?.statLog?.length, curTrainings?.length);
    return parseInt(targetPlan?.statPlan?.[numTrains] ?? targetPlan?.primaryStat, 10);
  })();
  return stat;
}

export function getCareSettings(state: PockestState) {
  if (state?.autoPlan) {
    const stat = getTargetMonsterCurrentStat(state);
    const routeSpec = getTargetMonsterCurrentRouteSpec(state);
    if (!routeSpec) return { stat };
    const {
      cleanFrequency,
      feedFrequency,
      feedTarget,
    } = routeSpec;
    return {
      stat,
      cleanFrequency,
      feedFrequency,
      feedTarget,
    };
  }
  return {
    stat: state?.stat,
    cleanFrequency: state?.cleanFrequency,
    feedFrequency: state?.feedFrequency,
    feedTarget: state?.feedTarget,
  };
}

export function getPlanNeglectOffset(state: PockestState) {
  let ageOffset = state?.planAge && state?.planAge > 1
    ? MONSTER_AGE[Math.max(2, state.planAge)] : 0;
  if (state.planAge === 5) {
    // optimize planned age so we can die just 1 hour after evolution
    ageOffset -= (24 * 60 * 60 * 1000); // -1 day (2d)
  }
  return ageOffset;
}

export function getPlanStunOffset(state: PockestState) {
  if (state?.planAge === 6) return null;
  const ageOffset = state?.planAge && state?.planAge > 1
    ? Math.max(0, MONSTER_AGE[Math.max(2, state.planAge)] - (5 * 60 * 60 * 1000))
    : 0;
  return ageOffset;
}

export function getCurrentPlanSchedule(state: PockestState) {
  const targetPlan = getTargetMonsterPlan(state);
  const birth = state?.data?.monster?.live_time;
  if (!birth) return {};
  const neglectOffset = getPlanNeglectOffset(state);
  const cleanSchedule = (state?.autoPlan && targetPlan?.planRoute) ? targetPlan.planRoute.reduce((fullSchedule, spec, index) => {
    if (!spec) return fullSchedule;
    if (spec.startTime > neglectOffset) return fullSchedule;
    const start = birth + spec.startTime;
    const end = spec.endTime > neglectOffset ? birth + neglectOffset : birth + spec.endTime;
    const schedule = getTimeIntervals(
      start,
      end,
      state?.planAge === 5 && index >= 2 ? 6 : spec.cleanFrequency,
      spec.cleanOffset,
    ) || [];
    return [
      ...fullSchedule,
      ...schedule,
    ];
  }, [] as TimeInterval[]) : getTimeIntervals(
    birth,
    birth + 7 * 24 * 60 * 60 * 1000,
    state?.cleanFrequency,
    0,
  );
  if (cleanSchedule?.[0]?.start === birth) {
    // remove unnecessary first clean
    cleanSchedule.shift();
  }
  interface FeedInterval extends TimeInterval {
    feedTarget?: number;
  }
  const feedSchedule: FeedInterval[] = (state?.autoPlan && targetPlan?.planRoute) ? targetPlan.planRoute.reduce((fullSchedule, spec) => {
    if (!spec) return fullSchedule;
    if (spec.startTime > neglectOffset) return fullSchedule;
    const start = birth + spec.startTime;
    const end = spec.endTime > neglectOffset ? birth + neglectOffset : birth + spec.endTime;
    const schedule = (getTimeIntervals(
      start,
      end,
      spec.feedFrequency,
      spec.feedOffset,
    ) || []).map((s) => ({
      ...s,
      feedTarget: spec.feedTarget,
    }));
    return [
      ...fullSchedule,
      ...schedule,
    ];
  }, [] as FeedInterval[]) : (getTimeIntervals(
    birth,
    birth + 7 * 24 * 60 * 60 * 1000,
    state?.feedFrequency,
    0,
  ) || []);
  interface TrainInterval extends TimeInterval {
    stat?: number;
  }
  const trainSchedule: TrainInterval[] = (Array.from(new Array(14))).reduce((fullSchedule, _unused, index) => {
    const startOffset = (12 * 60 * 60 * 1000) * index;
    if (startOffset > neglectOffset) return fullSchedule;
    return [
      ...fullSchedule,
      {
        start: birth + startOffset,
        stat: state?.statPlanId?.split('')?.[index] || state?.planId?.slice(-2, -1),
      },
    ];
  }, []);
  return {
    cleanSchedule,
    feedSchedule,
    trainSchedule,
  };
}

export function getMatchSchedule(state: PockestState) {
  const birth = state?.data?.monster?.live_time;
  if (!birth) return [];
  const targetDeath = MONSTER_AGE[Math.max(2, state?.planAge || 6)];
  const firstMatchTime = (state?.planAge < 4 ? birth : getFirstMatchTime(state)) ?? birth;
  const numMatches = Math.max(0, Math.ceil((birth + targetDeath - firstMatchTime) / daysToMs(1)));
  const schedule = Array.from(new Array(numMatches)).map((_v, i) => ({
    start: firstMatchTime + (i * daysToMs(1)),
  }));
  return schedule;
}

export function getCurrentPlanScheduleWindows(state: PockestState) {
  const { cleanSchedule, feedSchedule } = getCurrentPlanSchedule(state);
  const now = Date.now();
  const nextCleanWindow = cleanSchedule && cleanSchedule?.find((scheduleWindow) => now < scheduleWindow.start);
  const currentCleanWindow = cleanSchedule && cleanSchedule?.find(
    (scheduleWindow) => now >= scheduleWindow.start && now <= scheduleWindow.end,
  );
  const nextFeedWindow = feedSchedule && feedSchedule?.find((scheduleWindow) => now < scheduleWindow.start);
  const currentFeedWindow = feedSchedule && feedSchedule?.find(
    (scheduleWindow) => now >= scheduleWindow.start && now <= scheduleWindow.end,
  );
  return {
    nextCleanWindow,
    currentCleanWindow,
    nextFeedWindow,
    currentFeedWindow,
  };
}

export function isMonsterDead(state: PockestState, data?: BucklerStatusData | null) {
  if (data?.event === 'hatching') return false;
  if (data?.event === 'death') return true;
  const now = Date.now();
  const deathTimestamp = getDeathTimer({
    ...state,
    data: data || state?.data,
  });
  return deathTimestamp ? now >= deathTimestamp : false;
}

export function isMonsterDeparted(state: PockestState, data?: BucklerStatusData | null) {
  if (data?.event === 'hatching') return false;
  if (data?.event === 'departure') return true;
  const monster = data?.monster || state?.data?.monster;
  const now = Date.now();
  const birthTimestamp = state?.eggTimestamp === monster?.live_time
    ? state?.eggTimestamp
    : monster?.live_time;
  return birthTimestamp && now >= (birthTimestamp + daysToMs(7));
}

export function isMonsterMissing(_state: PockestState, data?: BucklerStatusData | null) {
  if (data?.event === 'hatching') return false;
  return data?.event === 'monster_not_found';
}

export function getAutoPlanSettings(state: PockestState) {
  const statPlanId = getTargetMonsterStatPlanId(state);
  const targetPlan = getTargetMonsterPlan(state);
  const targetPlanSpecs = getTargetMonsterCurrentRouteSpec(state);
  const stat = getTargetMonsterCurrentStat(state) ?? getTargetMonsterNextStat(state) ?? state.stat;
  return {
    autoPlan: true,
    autoClean: true,
    autoFeed: true,
    autoTrain: true,
    autoMatch: true,
    autoCure: true,
    planId: targetPlan?.planId,
    statPlanId,
    planAge: targetPlan?.planAge,
    stat,
    cleanOffset: targetPlanSpecs?.cleanOffset,
    feedOffset: targetPlanSpecs?.feedOffset,
    cleanFrequency: targetPlanSpecs?.cleanFrequency,
    feedFrequency: targetPlanSpecs?.feedFrequency,
    feedTarget: targetPlanSpecs?.feedTarget,
  };
}

export function getAutoSettings(state: PockestState, data?: BucklerStatusData | null, settingsOverride: Settings = {}) {
  let newSettings: Partial<PockestState> = {
    ...settingsOverride,
    // TODO: re-enable autoQueue
    autoQueue: false,
  };
  if (newSettings.simpleMode ?? state.simpleMode) {
    newSettings.autoPlan = true;
  }
  const planQueue = newSettings.planQueue ?? state.planQueue;
  const isAutoQueue = planQueue?.length && (newSettings.autoQueue ?? state.autoQueue);
  if (isAutoQueue) {
    newSettings.autoPlan = true;
    newSettings.monsterId = planQueue[0].monsterId;
    newSettings.planId = planQueue[0].planId;
    newSettings.statPlanId = planQueue[0].statPlanId;
    newSettings.planAge = planQueue[0].planAge;
  }
  const isMonsterGone = isMonsterDead(state, data)
    || isMonsterDeparted(state, data)
    || isMonsterMissing(state, data);
  if (isMonsterGone) {
    newSettings.autoPlan = true;
    newSettings.paused = !isAutoQueue;
    newSettings.statLog = [];
    newSettings.eggId = null;
    newSettings.eggTimestamp = null;
  }
  if (newSettings.autoPlan ?? state.autoPlan) {
    const autoPlanSettings = getAutoPlanSettings({
      ...state,
      ...newSettings,
      data,
    });
    newSettings = {
      ...newSettings,
      ...autoPlanSettings,
    };
  }
  return newSettings;
}

export function getPlanEvolutions(state: PockestState): Record<string, Monster> {
  if (!state?.planId) return {};
  const parsedPlanId = parsePlanId(state.planId);
  if (!parsedPlanId) return {};
  const {
    planEgg,
    planRouteId,
    primaryStatLetter,
    planAge,
  } = parsedPlanId;
  const numEvolutions = Math.max(2, Math.min(5, planAge));
  const eggMonsters = state.allMonsters.filter((m) => m?.eggIds?.includes(planEgg));
  const planEvolutions = Array.from(new Array(numEvolutions)).reduce((acc, _val, index) => {
    const fromMon = acc[index];
    const age = index + 1;
    const matchingMonsters = eggMonsters.filter((m) => m.age === age
      && (!fromMon || m.from.includes(fromMon.monster_id)));
    const matchingIndex = (() => {
      if (age === 3) {
        return ['A', 'B', 'C'].indexOf(planRouteId.split('')[0]);
      }
      if (age === 4) {
        return ['L', 'R'].indexOf(planRouteId.split('')[1]);
      }
      if (age === 5) {
        return matchingMonsters.findIndex((m) => m.planId && (new RegExp(`^${planEgg}${planRouteId}${primaryStatLetter}\\d$`)).test(m.planId));
      }
      return 0;
    })();
    return {
      ...acc,
      [age]: matchingMonsters[matchingIndex],
    };
  }, {});
  return planEvolutions;
}

export function getPlanLog(state: PockestState) {
  const birth = state?.data?.monster?.live_time;
  if (!birth) return [];
  const planSchedule = getCurrentPlanSchedule(state);
  if (!planSchedule) return [];
  const {
    cleanSchedule,
    feedSchedule,
    trainSchedule,
  } = planSchedule;
  const matchSchedule = getMatchSchedule(state);
  type PlanLogEntry = {
    start: number,
    startOffset?: number,
    completion?: boolean,
    missed?: boolean,
    label: string,
    logType?: string,
    logGrace?: number,
  };
  let data: PlanLogEntry[] = [];
  const stunOffset = getPlanStunOffset(state);
  data.push({
    logType: 'hatching',
    start: birth,
    completion: true,
    label: 'Hatch',
  });
  const planEvolutions = getPlanEvolutions(state);
  if (typeof stunOffset === 'number') {
    const planStunOffset = getPlanStunOffset(state) || 0;
    const startStopCure = birth + planStunOffset;
    const lastClean = cleanSchedule && cleanSchedule[cleanSchedule.length - 1];
    const lastCleanTime = lastClean?.start || birth;
    const deathByPoop = lastCleanTime + (GARBAGE_TIME * 12);
    const lastFeed = feedSchedule && feedSchedule[feedSchedule.length - 1];
    const lastFeedTime = lastFeed?.start || birth;
    const birthHungerIndex = (lastFeedTime - birth) / STOMACH_TIME;
    const birthStarvationIndex = birthHungerIndex + (lastFeed?.feedTarget || 0);
    const deathByStarvation = birth + (STOMACH_TIME * birthStarvationIndex);
    const stunTimer = Math.min(deathByPoop, deathByStarvation) + STUN_OFFSET;
    const deathTimer = stunTimer + STUN_DEATH_OFFSET;
    data.push({
      start: startStopCure,
      completion: Date.now() >= startStopCure,
      label: 'Stop Curing',
    });
    data.push({
      start: stunTimer,
      completion: Date.now() >= stunTimer, // TODO: add to log?
      label: 'Stun',
    });
    data.push({
      start: deathTimer,
      logType: 'death',
      label: 'Death',
    });
  } else {
    const start = birth + MONSTER_AGE[6];
    data.push({
      start,
      logType: 'departure',
      label: 'Departure',
    });
  }
  data = [
    ...data,
    ...(Object.keys(MONSTER_AGE)
      .map((key) => parseInt(key, 10))
      .filter((age) => age > 1 && age <= Math.max(2, Math.min(5, state?.planAge)))
      .map((age) => ({
        logType: 'evolution',
        logGrace: 1000 * 60 * 60,
        label: `Evolve (${planEvolutions?.[age]?.name_en || '???'})`,
        start: birth + MONSTER_AGE[age],
        completion: planEvolutions ? !!getCurrentMonsterLogs(state, 'evolution').find((l) => l.monsterId === planEvolutions?.[age]?.monster_id) : null,
      }))),
    ...(cleanSchedule?.map((w) => ({
      logType: 'cleaning',
      logGrace: 1000 * 60 * 60,
      label: 'Clean',
      ...w,
    })) ?? []),
    ...(feedSchedule?.map((w) => ({
      logType: 'meal',
      logGrace: 1000 * 60 * 60,
      label: `Feed (${w.feedTarget} ♡)`,
      ...w,
    })) ?? []),
    ...(trainSchedule?.map((w) => ({
      logType: 'training',
      logGrace: 1000 * 60 * 60 * 12,
      label: `Train ${w.stat}`,
      ...w,
    })) ?? []),
    ...(matchSchedule?.map((w) => ({
      logType: 'exchange',
      logGrace: 1000 * 60 * 60 * 12,
      label: 'Match',
      ...w,
    })) ?? []),
  ].map((w: PlanLogEntry) => {
    const completion = w.completion
      ?? !!(
        getCurrentMonsterLogs(state, w.logType || '').find((l) => l?.timestamp >= w.start
          && l?.timestamp < (w.start + (w.logGrace || 0)))
      );
    return {
      ...w,
      startOffset: w.start - birth,
      missed: !completion && Date.now() >= (w.start + (w.logGrace || 0)),
      completion: !!completion,
    };
  }).sort((a, b) => a.start - b.start);
  return data;
}

export function isConfirmedMonster(state: PockestState, data: BucklerStatusData) {
  const matchingMonster = state.allMonsters.find((m) => data?.monster?.hash
    && m.monster_id === getMonsterIdFromHash(data?.monster?.hash));
  return matchingMonster?.confirmed;
}

export async function getDiscordReportEvoSuccess(state: PockestState, data: BucklerStatusData) {
  const encycloData = state?.allMonsters?.find((m) => data?.monster?.hash
    && m.monster_id === getMonsterIdFromHash(data?.monster?.hash));
  const mementosOwned = getOwnedMementoMonsterNames(state);
  const nameEnStr = `Name (EN): **${encycloData?.name_en}**`;
  const nameStr = `Name: **${encycloData?.name}**`;
  const descStr = `Description: **${encycloData?.description.replace(/\n/g, ' ')}**`;
  const descEnStr = `Description (EN): **${encycloData?.description_en.replace(/\n/g, ' ')}**`;
  const hashStr = `Hash: **${encycloData?.hash}**`;
  const planIdStr = `${state?.planId}`;
  const statPlanStr = `${state?.statPlanId}`;
  const planStr = `Plan: **${planIdStr}** / ${statPlanStr ? `**${statPlanStr}**` : ''}`;
  const statLogStr = state?.statLog?.map((s) => `${STAT_ID_ABBR[s]}`)?.slice(0, 6)?.join('');
  const statLog = `Training Log: ${statLogStr ? `**${statLogStr}**` : ''}`;
  const statsTotal = data?.monster
    ? data.monster.power + data.monster.speed + data.monster.technic : 0;
  const statBreakdownStr = `**P** ${data?.monster?.power} + **S** ${data?.monster?.speed} + **T** ${data?.monster?.technic} = ${statsTotal}`;
  const statsStr = `Stats: ${statBreakdownStr}`;
  const ownedMementosStr = `Owned Mementos: ${mementosOwned.map((mem) => `**${mem}**`).join(', ') || '**None**'}`;
  const charSprites = data?.monster?.hash ? await fetchCharSprites(data?.monster?.hash) : [];
  const idle1Sprite = charSprites?.find((sprite) => sprite?.fileName.includes('idle_1'));
  const embed = {
    description: `${nameEnStr}\n${nameStr}\n${descEnStr}\n${descStr}\n${hashStr}\n${planStr}\n${statLog}\n${statsStr}\n${ownedMementosStr}`,
    color: 377190,
    author: {
      name: '🍃 EVOLUTION SUCCESS',
    },
    thumbnail: {
      url: `attachment://${idle1Sprite?.fileName}`,
    },
    url: `https://folklorelabs.io/pockest-helper-data/v2/monsters.json?hash=${data?.monster?.hash}`, // hack for grouping files into embed
  };
  const files = [{
    base64: idle1Sprite?.data,
    name: `${idle1Sprite?.fileName}`,
  }];
  return {
    files,
    embeds: [embed],
  };
}

export function getDiscordReportEvoFailure(state: PockestState, data: BucklerStatusData) {
  const mementosOwned = getOwnedMementoMonsterNames(state);
  const planIdStr = `${state?.planId}`;
  const statPlanStr = `${state?.statPlanId}`;
  const planStr = `\nPlan: **${planIdStr}** / **${statPlanStr}**`;
  const statLogStr = state?.statLog?.map((s) => `${STAT_ID_ABBR[s]}`)?.slice(0, 6)?.join('');
  const statLog = `\nTraining Log: ${statLogStr ? `**${statLogStr}**` : ''}`;
  const statsTotal = data?.monster
    ? data.monster.power + data.monster.speed + data.monster.technic : 0;
  const statBreakdownStr = `**P** ${data?.monster?.power} + **S** ${data?.monster?.speed} + **T** ${data?.monster?.technic} = ${statsTotal}`;
  const statsStr = `\nStats: ${statBreakdownStr}`;
  const ownedMementosStr = `\nOwned Mementos: ${mementosOwned.map((mem) => `**${mem}**`).join(', ') || '**None**'}`;
  return {
    embeds: [{
      description: `${planStr}${statLog}${statsStr}${ownedMementosStr}`,
      color: 15348524, // 5177601,
      author: {
        name: '🫠 EVOLUTION FAILURE',
      },
    }],
  };
}

export async function getDiscordReportMemento(state: PockestState, data: BucklerStatusData) {
  const encycloData = state?.allMonsters?.find((m) => data?.monster?.hash
    && m.monster_id === getMonsterIdFromHash(data?.monster?.hash));
  const newMementoData = encycloData?.memento_hash && encycloData?.memento_hash !== '???' ? encycloData : data?.monster;
  const nameEnStr = `\nName (EN): **${newMementoData?.memento_name_en}**`;
  const nameStr = `\nName: **${newMementoData?.memento_name}**`;
  const descEnStr = `\nDescription (EN): **${encycloData?.memento_description_en?.replace(/\n/g, ' ') || '???'}**`;
  const descStr = `\nDescription: **${encycloData?.memento_description?.replace(/\n/g, ' ') || '???'}**`;
  const hashStr = `\nHash: **${newMementoData?.memento_hash}**`;
  const fromStr = `\nFrom: **${newMementoData?.name_en}** (${newMementoData?.name})`;
  const base64 = await toDataUrl(`https://www.streetfighter.com/6/buckler/assets/minigame/img/memento/${newMementoData?.memento_hash}_memento.png`);
  return {
    files: [{
      base64,
      name: `${newMementoData?.memento_hash}.png`,
    }],
    embeds: [{
      description: `${nameEnStr}${nameStr}${descEnStr}${descStr}${hashStr}${fromStr}`,
      color: 15049006,
      author: {
        name: '🏆 MEMENTO',
      },
      thumbnail: {
        url: `attachment://${newMementoData?.memento_hash}.png`,
      },
    }],
  };
}

export function isMatchDiscovery(pockestState: PockestState, exchangeResult: Partial<BucklerMatchResults>) {
  const monster = pockestState?.allMonsters
    .find((m) => pockestState?.data?.monster?.hash && m.monster_id === getMonsterIdFromHash(pockestState?.data?.monster?.hash));
  const allMissing = [
    ...(monster?.matchSusFever || []),
    ...(monster?.matchUnknown || []),
    ...(monster?.matchSusNormal || []),
  ];
  return typeof exchangeResult?.target_monster_id === 'number' && allMissing.includes(exchangeResult?.target_monster_id);
}

export function getDiscordReportMatch(state: PockestState, exchangeResult: Partial<BucklerMatchResults>, opponentName: string) {
  const isFever = exchangeResult?.is_spmatch;
  const header = isFever ? '🔥 FEVER MATCH' : '⚔️ NORMAL MATCH';
  const embed = {
    description: `**${state?.data?.monster?.name_en}** *vs* **${opponentName}**`,
    color: isFever ? 14177041 : 0,
    author: {
      name: header,
    },
  };
  return {
    embeds: [embed],
  };
}

export async function getDiscordReportSighting(_state: PockestState, _data: BucklerStatusData, matchResults: BucklerPotentialMatch) {
  const nameEnStr = `\nName (EN): **${matchResults?.name_en}**`;
  const nameStr = `\nName: **${matchResults?.name}**`;
  const hashStr = `\nHash: **${matchResults?.hash}**`;
  const statsTotal = matchResults ? matchResults.power + matchResults.speed + matchResults.technic : 0;
  const statBreakdownStr = `**P** ${matchResults?.power || 0} + **S** ${matchResults?.speed || 0} + **T** ${matchResults?.technic || 0} = ${statsTotal}`;
  const statsStr = `\nStats: ${statBreakdownStr}`;
  const charSprites = await fetchCharSprites(matchResults?.hash);
  const idle1Sprite = charSprites?.find((sprite) => sprite?.fileName.includes('idle_1'));
  const embed = {
    description: `${nameEnStr}${nameStr}${hashStr}${statsStr}`,
    color: 501228,
    author: {
      name: '🔎 SIGHTING',
    },
    thumbnail: {
      url: `attachment://${idle1Sprite?.fileName}`,
    },
    url: `https://folklorelabs.io/pockest-helper-data/v2/hashes.json?hash=${matchResults?.hash}`, // hack for grouping files into embed
  };
  const files = [{
    base64: idle1Sprite?.data,
    name: `${idle1Sprite?.fileName}`,
  }];
  return {
    files,
    embeds: [embed],
  };
}
