import getTimeIntervals from '../../utils/getTimeIntervals';
import getTotalStats from '../../utils/getTotalStats';
import getTargetMonsterPlan, { getCurrentTargetMonsterPlan } from '../../utils/getTargetMonsterPlan';
import getDeathTimer from '../../utils/getDeathTimer';
import { MONSTER_LIFESPAN } from '../../utils/getAgeTimer';
import daysToMs from '../../utils/daysToMs';
import getMonsterIdFromHash from '../../utils/getMonsterIdFromHash';

export function getLogEntry(pockestState, data) {
  const mergedData = data ?? pockestState?.data;
  return {
    logType: mergedData?.event,
    timestamp: new Date().getTime(),
    monsterId: getMonsterIdFromHash(mergedData?.monster?.hash),
    monsterBirth: mergedData?.monster?.live_time,
  };
}

export function isMonsterGone(pockestState) {
  if (pockestState?.data?.event === 'hatching') return false;
  if (['monster_not_found', 'departure', 'death'].includes(pockestState?.data?.event)) return true;
  if (!pockestState?.error && !pockestState?.data?.monster) return true;
  const now = (new Date()).getTime();
  const isDead = now >= getDeathTimer(pockestState);
  const birthTimestamp = pockestState?.eggTimestamp || pockestState?.data?.monster?.live_time;
  const hasLeft = now >= (birthTimestamp + MONSTER_LIFESPAN[5]);
  return isDead || hasLeft;
}

export async function fetchMatchList() {
  const url = 'https://www.streetfighter.com/6/buckler/api/minigame/exchange/list';
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
  const { data } = await response.json();
  return data;
}

export async function fetchPockestStatus() {
  const url = 'https://www.streetfighter.com/6/buckler/api/minigame/status';
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
  const resJson = await response.json();
  const data = {
    event: resJson?.event || resJson?.message || resJson?.data?.message,
    ...resJson?.data,
  };
  return data;
}

export function getMonsterId(state) {
  const hashId = state?.data?.monster?.hash;
  if (!hashId) return null;
  return parseInt(hashId.slice(0, 4), 10);
}

export async function getBestMatch(state, exchangeList) {
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

export function getOwnedMementoMonsterIds(state) {
  return state?.allMonsters
    ?.filter((m) => m?.memento_flg)
    .map((m) => m?.monster_id) ?? [];
}

export function getOwnedMementoMonsterNames(state) {
  const mementosOwned = getOwnedMementoMonsterIds(state);
  return mementosOwned.map((id) => state.allMonsters
    ?.find((m) => m.monster_id === id)?.name_en);
}

export function getCurrentMonsterLogs(state, logType) {
  return state?.log.filter((entry) => {
    if (!state?.data?.monster) return false;
    if (logType && entry?.logType !== logType) return false;
    return entry.timestamp >= state?.data?.monster?.live_time;
  });
}

export function getCurrentPlanStats(state) {
  if (state?.autoPlan) {
    return getCurrentTargetMonsterPlan(state);
  }
  return {
    stat: state?.stat,
    cleanFrequency: state?.cleanFrequency,
    feedFrequency: state?.feedFrequency,
    feedTarget: state?.feedTarget,
  };
}

export function getPlanNeglectOffset(state) {
  let ageOffset = state?.planAge && state?.planAge > 1
    ? MONSTER_LIFESPAN[Math.max(1, state.planAge - 1)] : 0;
  if (state.planAge === 5) {
    // optimize planned age so we can die just 1 hour after evolution
    ageOffset -= (24 * 60 * 60 * 1000); // -1 day (2d)
  }
  return ageOffset;
}

export function getPlanStunOffset(state) {
  if (state?.planAge === 6) return null;
  const ageOffset = state?.planAge && state?.planAge > 1
    ? Math.max(0, MONSTER_LIFESPAN[Math.max(1, state.planAge - 1)] - (4 * 60 * 60 * 1000))
    : 0;
  return ageOffset;
}

export function getCurrentPlanSchedule(state) {
  const targetPlan = getTargetMonsterPlan(state);
  const birth = state?.data?.monster?.live_time;
  if (!birth) return {};
  const neglectOffset = getPlanNeglectOffset(state);
  const cleanSchedule = state?.autoPlan ? ['planDiv1', 'planDiv2', 'planDiv3']
    .reduce((fullSchedule, div) => {
      const spec = targetPlan[div];
      if (!spec) return fullSchedule;
      if (spec.startTime > neglectOffset) return fullSchedule;
      const start = birth + spec.startTime;
      const end = spec.endTime > neglectOffset ? birth + neglectOffset : birth + spec.endTime;
      const schedule = getTimeIntervals(
        start,
        end,
        state?.planAge === 5 && div === 'planDiv3' ? 6 : spec.cleanFrequency,
        spec.cleanOffset,
      );
      return [
        ...fullSchedule,
        ...schedule,
      ];
    }, []) : getTimeIntervals(
    birth,
    birth + 7 * 24 * 60 * 60 * 1000,
    state?.cleanFrequency,
    0,
  );
  const feedSchedule = state?.autoPlan ? ['planDiv1', 'planDiv2', 'planDiv3']
    .reduce((fullSchedule, div) => {
      const spec = targetPlan[div];
      if (!spec) return fullSchedule;
      if (spec.startTime > neglectOffset) return fullSchedule;
      const start = birth + spec.startTime;
      const end = spec.endTime > neglectOffset ? birth + neglectOffset : birth + spec.endTime;
      const schedule = getTimeIntervals(
        start,
        end,
        spec.feedFrequency,
        spec.feedOffset,
      ).map((s) => ({
        ...s,
        feedTarget: spec.feedTarget,
      }));
      return [
        ...fullSchedule,
        ...schedule,
      ];
    }, []) : getTimeIntervals(
    birth,
    birth + 7 * 24 * 60 * 60 * 1000,
    state?.feedFrequency,
    0,
  );
  const trainSchedule = (Array.from(new Array(14))).reduce((fullSchedule, _unused, index) => {
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

export function getCurrentPlanScheduleWindows(state) {
  const { cleanSchedule, feedSchedule } = getCurrentPlanSchedule(state);
  const now = new Date();
  const nextCleanWindow = cleanSchedule?.find((scheduleWindow) => now < scheduleWindow.start);
  const currentCleanWindow = cleanSchedule?.find(
    (scheduleWindow) => now >= scheduleWindow.start && now <= scheduleWindow.end,
  );
  const nextFeedWindow = feedSchedule?.find((scheduleWindow) => now < scheduleWindow.start);
  const currentFeedWindow = feedSchedule?.find(
    (scheduleWindow) => now >= scheduleWindow.start && now <= scheduleWindow.end,
  );
  return {
    nextCleanWindow,
    currentCleanWindow,
    nextFeedWindow,
    currentFeedWindow,
  };
}

export function isMonsterDead(state, data) {
  if (data?.event === 'hatching') return false;
  if (data?.event === 'death') return true;
  const now = Date.now();
  const deathTimestamp = getDeathTimer({
    ...state,
    data: data || state?.data,
  });
  return now >= deathTimestamp;
}

export function isMonsterDeparted(state, data) {
  if (data?.event === 'hatching') return false;
  if (data?.event === 'departure') return true;
  const monster = data?.monster || state?.data?.monster;
  const now = Date.now();
  const birthTimestamp = state?.eggTimestamp === monster?.live_time
    ? state?.eggTimestamp
    : monster?.live_time;
  return now >= (birthTimestamp + daysToMs(7));
}

export function isMonsterMissing(state, data) {
  if (data?.event === 'hatching') return false;
  return data?.event === 'monster_not_found';
}

export function getAutoPlanSettings(state, data, settingsOverride = {}) {
  const newSettings = {
    ...settingsOverride,
  };
  if (isMonsterDead(state, data)
    || isMonsterDeparted(state, data)
    || isMonsterMissing(state, data)
  ) {
    console.log('Monster missing! Auto settings.', {
      dead: isMonsterDead(state, data),
      departed: isMonsterDeparted(state, data),
      missing: isMonsterMissing(state, data),
    });
    newSettings.autoPlay = true;
    newSettings.paused = true;
    newSettings.statLog = [];
    newSettings.eggId = null;
    newSettings.eggTimestamp = null;
  }
  if (newSettings.autoPlan ?? state.autoPlan) {
    const targetMonsterPlan = getCurrentTargetMonsterPlan({
      ...state,
      ...newSettings,
      data,
    });
    newSettings.autoPlan = true;
    newSettings.autoClean = true;
    newSettings.autoFeed = true;
    newSettings.autoTrain = true;
    newSettings.autoMatch = true;
    newSettings.autoCure = true;
    newSettings.planId = targetMonsterPlan?.planId;
    newSettings.statPlanId = targetMonsterPlan?.statPlanId;
    newSettings.planAge = targetMonsterPlan?.planAge;
    newSettings.stat = targetMonsterPlan?.stat;
    newSettings.cleanOffset = targetMonsterPlan?.cleanOffset;
    newSettings.feedOffset = targetMonsterPlan?.feedOffset;
    newSettings.cleanFrequency = targetMonsterPlan?.cleanFrequency;
    newSettings.feedFrequency = targetMonsterPlan?.feedFrequency;
    newSettings.feedTarget = targetMonsterPlan?.feedTarget;
  }
  return newSettings;
}
