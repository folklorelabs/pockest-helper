import React, {
  createContext,
  useReducer,
  useMemo,
  useEffect,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import monsters from '../data/monsters.json';
import getTimeIntervals from '../utils/getTimeIntervals';
import getTotalStats from '../utils/getTotalStats';
import getMonsterPlan, { getCurrentMonsterPlan } from '../utils/getMonsterPlan';
import { STAT_ID } from '../config/stats';

// STATE
const INITIAL_STATE = {
  data: {},
  paused: true,
  monsterId: null,
  autoPlan: true,
  autoFeed: false,
  cleanFrequency: 2,
  feedFrequency: 4,
  feedTarget: 6,
  autoClean: false,
  autoTrain: false,
  matchPriority: 0,
  log: [],
  stat: 1,
  loading: false,
  error: null,
  initialized: false,
};

// GETTERS

export async function fetchMatchList() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/exchange/list');
  const { data } = await response.json();
  return data;
}

export function getMonsterId(state) {
  const hashId = state?.data?.monster?.hash;
  if (!hashId) return null;
  return parseInt(hashId.slice(0, 4), 10);
}

export async function getBestMatch(state) {
  const monsterId = getMonsterId(state);
  const monster = monsters.find((m) => m.monster_id === monsterId);
  const matchFeverOptions = monster?.matchFever;
  const { exchangeList } = await fetchMatchList();
  const sortedMatches = exchangeList?.sort((a, b) => {
    const discoveryPref = state?.matchPriority === 1;
    const aFever = matchFeverOptions?.includes(a.monster_id) ? 1.5 : 1;
    const bFever = matchFeverOptions?.includes(b.monster_id) ? 1.5 : 1;
    if (discoveryPref && aFever && !bFever) return 1;
    if (discoveryPref && bFever && !aFever) return -1;
    const aTotal = getTotalStats(a) * aFever;
    const bTotal = getTotalStats(b) * bFever;
    return bTotal - aTotal;
  });
  return sortedMatches?.[0];
}

export function getCurrentPlanStats(state) {
  if (state?.autoPlan) {
    const age = state?.data?.monster?.age;
    return getCurrentMonsterPlan(state?.monsterId, age);
  }
  return {
    stat: state?.stat,
    cleanFrequency: state?.cleanFrequency,
    feedFrequency: state?.feedFrequency,
    feedTarget: state?.feedTarget,
  };
}

export function getCurrentPlanSchedule(state) {
  const targetPlan = getMonsterPlan(state?.monsterId);
  const birth = state?.data?.monster?.live_time;
  if (!birth) return {};
  const cleanSchedule = ['planDiv1', 'planDiv2', 'planDiv3']
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
    }, []);
  const feedSchedule = ['planDiv1', 'planDiv2', 'planDiv3']
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
    }, []);
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

// ACTIONS
export const ACTIONS = {
  REFRESH: 'POCKEST_REFRESH',
  ACTION_SUCCESS: 'POCKEST_ACTION_SUCCESS',
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
export function pockestAutoPlan({ autoPlan, monsterId, age }) {
  let newSettings = {
    autoPlan,
  };
  if (autoPlan) {
    newSettings = {
      ...newSettings,
      ...getCurrentMonsterPlan(monsterId, age),
      autoClean: true,
      autoFeed: true,
      autoTrain: true,
    };
  }
  return [ACTIONS.SETTINGS, newSettings];
}
export async function pockestRefresh() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/status');
  const { data } = await response.json();
  return [ACTIONS.REFRESH, data];
}
export async function pockestFeed(pockestState) {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/serving', {
    body: '{"type":1}',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  const { data } = await response.json();
  const logEntry = {
    logType: 'meal',
    timestamp: new Date().getTime(),
    monsterId: getMonsterId(pockestState),
  };
  return [ACTIONS.ACTION_SUCCESS, { data, logEntry }];
}
export async function pockestCure() {
  return [ACTIONS.ERROR, '[pockestCure] NYI'];
}
export async function pockestClean(pockestState) {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/cleaning', {
    body: '{"type":1}',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  const { data } = await response.json();
  const logEntry = {
    logType: 'clean',
    timestamp: new Date().getTime(),
    monsterId: getMonsterId(pockestState),
  };
  return [ACTIONS.ACTION_SUCCESS, { data, logEntry }];
}
export async function pockestTrain(pockestState, type) {
  if (type < 1 || type > 3) {
    return [ACTIONS.ERROR, '[pockestTrain] type needs to be 1, 2, or 3'];
  }
  const statType = STAT_ID[type];
  const statBefore = pockestState?.data?.monster?.[statType];
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
  const logEntry = {
    logType: 'training',
    timestamp: new Date().getTime(),
    monsterId: getMonsterId(pockestState),
    statType,
    statDiff: (data?.monster?.[statType] || 0) - statBefore,
  };
  return [ACTIONS.ACTION_SUCCESS, { data, logEntry }];
}
export async function pockestMatch(pockestState, match) {
  if (match?.slot < 1) {
    return [ACTIONS.ERROR, '[pockestMatch] slot needs to be > 1'];
  }
  const mementoBefore = pockestState?.data?.monster?.memento_point;

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
  const logEntry = {
    logType: 'match',
    timestamp: new Date().getTime(),
    aId: getMonsterId(pockestState),
    bId: match?.monster_id,
    totalStats: getTotalStats(pockestState?.data?.monster) + getTotalStats(match?.monster),
    mementoDiff: Math.max((data?.monster?.memento_point || 0) - mementoBefore, 0),
  };
  return [ACTIONS.ACTION_SUCCESS, { data, logEntry }];
}
export async function pockestSelectEgg(id) {
  if (id < 1 || id > 4) {
    return [ACTIONS.ERROR, '[pockestSelectEgg] id needs to be 1, 2, 3, or 4'];
  }
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/eggs', {
    body: `{"id":${id}}`,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  const { data } = await response.json();
  return [ACTIONS.REFRESH, data];
}
export function pockestClearLog(pockestState, logTypes) {
  if (!Array.isArray(logTypes)) {
    return [ACTIONS.ERROR, `[pockestClearLog] Unknown logTypes ${logTypes}`];
  }
  const newLog = pockestState?.log?.filter((l) => !logTypes.includes(l.logType));
  return [ACTIONS.SET_LOG, newLog];
}

// REDUCER
function REDUCER(state, [type, payload]) {
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
      };
    case ACTIONS.PAUSE:
      return {
        ...state,
        paused: payload.paused ?? state?.paused,
      };
    case ACTIONS.REFRESH:
      return {
        ...state,
        loading: false,
        initialized: true,
        data: payload,
      };
    case ACTIONS.ACTION_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        log: [
          ...state.log,
          payload?.logEntry,
        ],
        data: payload?.data,
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
      };
    default:
      return { ...state };
  }
}

let initialState = {
  ...INITIAL_STATE,
};
const stateFromStorage = window.localStorage.getItem('PockestHelper');
if (stateFromStorage) {
  initialState = {
    ...initialState,
    ...JSON.parse(stateFromStorage),
    data: null,
    initialized: false,
    paused: true,
  };
}
const PockestContext = createContext({
  pockestState: initialState ?? INITIAL_STATE,
  pockestDispatch: () => { },
});

export function PockestProvider({
  children,
}) {
  const [pockestState, pockestDispatch] = useReducer(REDUCER, initialState);

  useEffect(() => {
    window.localStorage.setItem('PockestHelper', JSON.stringify(pockestState));
  }, [pockestState]);

  // grab data on init
  useEffect(() => {
    (async () => {
      pockestDispatch(await pockestRefresh());
    })();
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
