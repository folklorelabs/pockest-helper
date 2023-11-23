import React, {
  createContext,
  useReducer,
  useMemo,
  useEffect,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import monsters from '../data/monsters';
import routes from '../data/routes';
import getNextInterval from '../utils/getNextInterval';
import getTimeIntervals from '../utils/getTimeIntervals';
import getMonsterPlan from '../utils/getMonsterPlan';

// STATE
const INITIAL_STATE = {
  data: {},
  paused: true,
  monsterId: null,
  autoPlan: true,
  autoFeed: false,
  feedFrequency: 4,
  cleanFrequency: 2,
  autoClean: false,
  autoTrain: false,
  stat: 1,
  loading: false,
  error: null,
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

export async function getMonsterMatchFever(state) {
  const monsterId = getMonsterId(state);
  const monster = monsters.find((m) => m.monster_id === monsterId);
  const matchFeverOptions = monster?.matchFever;
  if (!matchFeverOptions || !matchFeverOptions.length) return null;
  const { exchangeList } = await fetchMatchList();
  const match = exchangeList.find((opp) => matchFeverOptions.includes(opp.monster_id));
  return match?.slot;
}

export function getCurrentPlan(state) {
  if (state?.autoPlan) {
    const age = state?.data?.monster?.age;
    const targetPlan = getMonsterPlan(state?.monsterId);
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
      stat: targetPlan?.stat,
      feedFrequency: targetPlanSpecs?.feedFrequency,
      cleanFrequency: targetPlanSpecs?.cleanFrequency,
    };
  }
  return {
    stat: state?.stat,
    feedFrequency: state?.feedFrequency,
    cleanFrequency: state?.cleanFrequency,
  };
}

export function getCurrentPlanSchedule(state) {
  const { cleanFrequency, feedFrequency } = getCurrentPlan(state);
  const birth = state?.data?.monster?.live_time;
  const death = birth + (1000 * 60 * 60 * 24 * 7);
  const cleanSchedule = getTimeIntervals(birth, death, cleanFrequency);
  const feedSchedule = getTimeIntervals(birth, death, feedFrequency);
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
        feedFrequency: payload.feedFrequency ?? state?.feedFrequency,
        cleanFrequency: payload.cleanFrequency ?? state?.cleanFrequency,
        stat: payload.stat ?? state?.stat,
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
      pockestDispatch([ACTIONS.LOADING]);
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
