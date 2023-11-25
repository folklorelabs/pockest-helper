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
  matchPreference: '',
  stat: 1,
  loading: false,
  error: null,
  initialized: false,
};

// ACTIONS
export const ACTIONS = {
  REFRESH: 'POCKEST_REFRESH',
  LOADING: 'POCKEST_LOADING',
  PAUSE: 'POCKEST_PAUSE',
  ERROR: 'POCKEST_ERROR',
  SETTINGS: 'POCKEST_SETTINGS',
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
export async function pockestFeed() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/serving', {
    body: '{"type":1}',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  const { data } = await response.json();
  return [ACTIONS.REFRESH, data];
}
export async function pockestCure() {
  return [ACTIONS.ERROR, '[pockestCure] NYI'];
}
export async function pockestClean() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/cleaning', {
    body: '{"type":1}',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  const { data } = await response.json();
  return [ACTIONS.REFRESH, data];
}
export async function pockestTrain(type) {
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
  return [ACTIONS.REFRESH, data];
}
export async function pockestMatch(slot) {
  if (slot < 1) {
    return [ACTIONS.ERROR, '[pockestMatch] slot needs to be > 1'];
  }
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/exchange/start', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ slot }),
  });
  const { data } = await response.json();
  return [ACTIONS.REFRESH, data];
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
    const aFever = matchFeverOptions?.includes(a.monster_id) ? 1.5 : 1;
    const aTotal = getTotalStats(a) * aFever;
    const bFever = matchFeverOptions?.includes(b.monster_id) ? 1.5 : 1;
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
        matchPreference: payload.matchPreference ?? state?.matchPreference,
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

const stateFromStorage = window.localStorage.getItem('PockestHelper');
const initialState = stateFromStorage && JSON.parse(stateFromStorage);
if (initialState) {
  delete initialState.data;
  delete initialState.initialized;
  initialState.paused = true;
}
const PockestContext = createContext({
  pockestState: initialState ?? INITIAL_STATE,
  pockestDispatch: () => { },
});

export function PockestProvider({
  children,
}) {
  const [pockestState, pockestDispatch] = useReducer(REDUCER, initialState ?? INITIAL_STATE);

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
