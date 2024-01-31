import React, {
  createContext,
  useReducer,
  useMemo,
  useEffect,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import getTimeIntervals from '../utils/getTimeIntervals';
import getTotalStats from '../utils/getTotalStats';
import getTargetMonsterPlan, { getCurrentTargetMonsterPlan } from '../utils/getTargetMonsterPlan';
import fetchAllMonsters from '../utils/fetchAllMonsters';
import fetchAllHashes from '../utils/fetchAllHashes';
import postDiscord from '../utils/postDiscord';
import isMatchDiscovery from '../utils/isMatchDiscovery';
import getMatchReportString from '../utils/getMatchReportString';
import getRandomMinutes from '../utils/getRandomMinutes';
import getDeathTimer from '../utils/getDeathTimer';
import { MONSTER_LIFESPAN } from '../utils/getAgeTimer';

// STATE
const INITIAL_STATE = {
  data: {},
  allMonsters: [],
  allHashes: [],
  paused: true,
  monsterId: -1,
  planId: '',
  statPlanId: '',
  autoPlan: true,
  autoFeed: true,
  cleanFrequency: 2,
  feedFrequency: 4,
  feedTarget: 6,
  autoClean: true,
  autoTrain: true,
  autoCure: false,
  matchPriority: 0,
  log: [],
  stat: 1,
  loading: false,
  error: null,
  initialized: false,
};

// UTIL
function getStateFromLocalStorage() {
  const stateFromStorage = window.localStorage.getItem('PockestHelper');
  const logFromStorage = window.localStorage.getItem('PockestHelperLog');
  return {
    ...INITIAL_STATE,
    ...(stateFromStorage ? JSON.parse(stateFromStorage) : {}),
    log: (logFromStorage ? JSON.parse(logFromStorage) : INITIAL_STATE.log),
  };
}

function saveStateToLocalStorage(state) {
  const stateToSave = { ...state };
  delete stateToSave?.data;
  delete stateToSave?.initialized;
  delete stateToSave?.paused;
  delete stateToSave?.loading;
  delete stateToSave?.error;
  delete stateToSave?.log;
  delete stateToSave?.allMonsters;
  delete stateToSave?.allHashes;
  window.localStorage.setItem('PockestHelper', JSON.stringify(stateToSave));
  window.localStorage.setItem('PockestHelperLog', JSON.stringify(state?.log));
}

// GETTERS

export function getLogEntry(pockestState) {
  return {
    logType: pockestState?.data?.event,
    timestamp: new Date().getTime(),
    monsterId: parseInt(pockestState?.data?.monster?.hash?.split('-')[0] || '-1', 10),
  };
}

export function isMonsterGone(pockestState) {
  if (['monster_not_found', 'departure', 'death'].includes(pockestState?.data?.event)) return true;
  if (!pockestState?.data?.monster) return null; // inconclusive
  const now = (new Date()).getTime();
  const isDead = now >= getDeathTimer(pockestState);
  const hasLeft = now >= (pockestState.data.monster.live_time + MONSTER_LIFESPAN[5]);
  return isDead || hasLeft;
}

export async function fetchMatchList() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/exchange/list');
  const { data } = await response.json();
  return data;
}

export async function fetchPockestStatus() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/status');
  const { data, event } = await response.json();
  return {
    ...data,
    event,
  };
}

export function getMonsterId(state) {
  const hashId = state?.data?.monster?.hash;
  if (!hashId) return null;
  return parseInt(hashId.slice(0, 4), 10);
}

export async function getBestMatch(state) {
  const monsterId = getMonsterId(state);
  const monster = state?.allMonsters?.find((m) => m.monster_id === monsterId);
  const { exchangeList } = await fetchMatchList();
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

export function getCurrentPlanSchedule(state) {
  const targetPlan = getTargetMonsterPlan(state);
  const birth = state?.data?.monster?.live_time;
  if (!birth) return {};
  const cleanSchedule = state?.autoPlan ? ['planDiv1', 'planDiv2', 'planDiv3']
    .reduce((fullSchedule, div) => {
      const spec = targetPlan[div];
      if (!spec) return fullSchedule;
      const schedule = getTimeIntervals(
        birth + spec.startTime,
        birth + spec.endTime,
        spec.cleanFrequency,
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
      const schedule = getTimeIntervals(
        birth + spec.startTime,
        birth + spec.endTime,
        spec.feedFrequency,
        spec.feedOffset,
      );
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
  return {
    cleanSchedule,
    feedSchedule,
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

export function getAutoPlanSettings(
  state,
  autoPlan,
  targetMonsterId,
  targetPlanId,
  targetStatPlanId,
) {
  let newSettings = {
    autoPlan: autoPlan ?? state.autoPlan,
  };
  if (isMonsterGone(state)) {
    newSettings = {
      ...newSettings,
      autoPlan: true,
      paused: true,
    };
  }
  if (newSettings.autoPlan) {
    // ensure default autoPlan settings are set
    newSettings = {
      ...newSettings,
      ...getCurrentTargetMonsterPlan(state, targetMonsterId, targetPlanId, targetStatPlanId),
      autoClean: true,
      autoFeed: true,
      autoTrain: true,
      autoMatch: true,
      autoCure: true,
    };
  }
  return newSettings;
}

// ACTIONS
export const ACTIONS = {
  INIT: 'POCKEST_INIT',
  REFRESH: 'POCKEST_REFRESH',
  LOADING: 'POCKEST_LOADING',
  PAUSE: 'POCKEST_PAUSE',
  ERROR: 'POCKEST_ERROR',
  SETTINGS: 'POCKEST_SETTINGS',
  SET_LOG: 'POCKEST_SET_LOG',
};
export function pockestLoading() {
  return [ACTIONS.LOADING];
}
export function pockestPause(paused) {
  return [ACTIONS.PAUSE, {
    paused,
  }];
}
export function pockestSettings(settings) {
  return [ACTIONS.SETTINGS, settings];
}
export function pockestPlanSettings(pockestState, {
  autoPlan,
  monsterId,
  planId,
  statPlanId,
}) {
  const newSettings = getAutoPlanSettings(
    pockestState,
    autoPlan ?? pockestState?.autoPlan,
    monsterId ?? pockestState?.monsterId,
    planId ?? pockestState?.planId,
    statPlanId ?? pockestState?.statPlanId,
  );
  return [ACTIONS.SETTINGS, newSettings];
}
export async function pockestRefresh(pockestState) {
  try {
    const data = await fetchPockestStatus();
    if (data && pockestState?.data?.monster?.hash !== data?.monster?.hash) {
      data.result = {
        ...getLogEntry({ data }),
        logType: 'age',
        monsterBefore: pockestState?.data?.monster,
      };
    }
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestFeed() {
  try {
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/serving', {
      body: '{"type":1}',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    const { data } = await response.json();
    data.result = {
      ...getLogEntry({ data }),
      ...data?.serving,
      stomach: data?.monster?.stomach,
    };
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestCure() {
  try {
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/cure', {
      body: '{"type":1}',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    const { data } = await response.json();
    data.result = {
      ...getLogEntry({ data }),
      ...data?.cure, // TODO: check that this is correct
    };
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestClean(pockestState) {
  try {
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/cleaning', {
      body: '{"type":1}',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    const { data } = await response.json();
    data.result = {
      ...getLogEntry({ data }),
      ...data?.cleaning,
      garbageBefore: pockestState?.data?.monster?.garbage,
    };
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestTrain(type) {
  try {
    if (type < 1 || type > 3) {
      return [ACTIONS.ERROR, '[pockestTrain] type needs to be 1, 2, or 3'];
    }
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/training', {
      body: `{"type":${type}}`,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    const { data } = await response.json();
    if (data?.event !== 'training') {
      return [ACTIONS.ERROR, '[pockestTrain] server responded with failure'];
    }
    data.result = {
      ...getLogEntry({ data }),
      ...data?.training,
    };
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestMatch(pockestState, match) {
  try {
    if (match?.slot < 1) {
      return [ACTIONS.ERROR, '[pockestMatch] slot needs to be > 1'];
    }
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/exchange/start', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ slot: match?.slot }),
    });
    const { data } = await response.json();
    if (data?.exchangable === false) {
      return [ACTIONS.ERROR, '[pockestMatch] server responded with failure'];
    }
    data.result = {
      ...getLogEntry({ data }),
      ...data?.exchangeResult,
      totalStats: getTotalStats(data?.monster) + getTotalStats(match),
      target_monster_name_en: match?.name_en,
    };
    const isDisc = isMatchDiscovery(pockestState, data.result);
    if (isDisc) {
      const report = `[Pockest Helper v${import.meta.env.APP_VERSION}]\n${getMatchReportString({
        pockestState,
        result: data.result,
      })}`;
      postDiscord(report);
    }
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestSelectEgg(id) {
  try {
    if (id < 1) return [ACTIONS.ERROR, '[pockestSelectEgg] id needs to be > 0'];
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/eggs', {
      body: `{"id":${id}}`,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    const { data } = await response.json();
    data.result = {
      ...getLogEntry({ data }),
      eggType: id,
      timestamp: data?.monster?.live_time,
    };
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export function pockestClearLog(pockestState, logTypes) {
  if (!Array.isArray(logTypes)) {
    return [ACTIONS.ERROR, `[pockestClearLog] logTypes ${logTypes} needs to be an array`];
  }
  const newLog = pockestState?.log
    ?.filter((entry) => !logTypes.includes(entry.logType)
    || entry.timestamp >= pockestState?.data?.monster?.live_time);
  return [ACTIONS.SET_LOG, newLog];
}
export async function pockestInit() {
  try {
    const [
      allMonsters,
      allHashes,
      data,
    ] = await Promise.all([
      fetchAllMonsters(),
      fetchAllHashes(),
      fetchPockestStatus(),
    ]);
    return [ACTIONS.INIT, {
      allMonsters,
      allHashes,
      data,
    }];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}

// REDUCER
function REDUCER(state, [type, payload]) {
  console.log('STATE CHANGE', { state, type, payload });
  switch (type) {
    case ACTIONS.LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ACTIONS.SETTINGS:
      return {
        ...state,
        monsterId: payload.monsterId ?? state?.monsterId,
        planId: payload.planId ?? state?.planId,
        statPlanId: payload.statPlanId ?? state?.statPlanId,
        autoPlan: payload.autoPlan ?? state?.autoPlan,
        autoFeed: payload.autoFeed ?? state?.autoFeed,
        autoClean: payload.autoClean ?? state?.autoClean,
        autoTrain: payload.autoTrain ?? state?.autoTrain,
        autoMatch: payload.autoMatch ?? state?.autoMatch,
        cleanFrequency: payload.cleanFrequency ?? state?.cleanFrequency,
        feedFrequency: payload.feedFrequency ?? state?.feedFrequency,
        feedTarget: payload.feedTarget ?? state?.feedTarget,
        stat: payload.stat ?? state?.stat,
        matchPriority: payload.matchPriority ?? state?.matchPriority,
        autoCure: payload.autoCure ?? state?.autoCure,
      };
    case ACTIONS.PAUSE:
      return {
        ...state,
        paused: payload.paused ?? state?.paused,
      };
    case ACTIONS.INIT:
      return {
        ...state,
        initialized: true,
        data: payload?.data,
        allMonsters: payload?.allMonsters,
        allHashes: payload?.allHashes,
        ...getAutoPlanSettings({
          ...state,
        }, state.autoPlan, state.monsterId, state.planId, state.statPlanId),
      };
    case ACTIONS.REFRESH:
      return {
        ...state,
        loading: false,
        data: payload,
        log: (payload?.result) ? [
          ...state.log,
          payload?.result,
        ] : state.log,
        ...getAutoPlanSettings({
          ...state,
          result: payload?.result,
        }, state.autoPlan, state.monsterId, state.planId, state.statPlanId),
      };
    case ACTIONS.SET_LOG:
      return {
        ...state,
        log: payload,
      };
    case ACTIONS.ERROR:
      return {
        ...state,
        loading: false,
        error: payload,
        log: [
          ...state.log,
          {
            ...getLogEntry(state),
            logType: 'error',
            error: `${payload.stack}`,
          },
        ],
      };
    default:
      return { ...state };
  }
}

const initialState = getStateFromLocalStorage();

const PockestContext = createContext({
  pockestState: initialState,
  pockestDispatch: () => { },
});

export function PockestProvider({
  children,
}) {
  const [pockestState, pockestDispatch] = useReducer(REDUCER, initialState);

  useEffect(() => {
    saveStateToLocalStorage(pockestState);
  }, [pockestState]);

  // grab data on init
  useEffect(() => {
    let initTimeout;
    const init = async () => {
      pockestDispatch(await pockestInit());
      const timeoutMs = getRandomMinutes(60);
      initTimeout = window.setTimeout(init, timeoutMs);
    };
    init();
    return () => {
      window.clearTimeout(initTimeout);
    };
  }, []);

  // wrap value in memo so we only re-render when necessary
  const providerValue = useMemo(() => ({
    pockestState,
    pockestDispatch,
  }), [pockestState, pockestDispatch]);

  return (
    <PockestContext.Provider value={providerValue}>
      {children}
    </PockestContext.Provider>
  );
}
PockestProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export function usePockestContext() {
  return useContext(PockestContext);
}
