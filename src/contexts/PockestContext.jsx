import React, {
  createContext,
  useReducer,
  useMemo,
  useEffect,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import monsters from '../config/monsters';
import routes from '../config/routes';
import getNextInterval from '../utils/getNextInterval';

// CONSTS
export const STAT_ICON = {
  1: '🥊',
  2: '👟',
  3: '🪵',
};
export const STAT_ID = {
  1: 'power',
  2: 'speed',
  3: 'technic',
};
export const FEED_INTERVAL = {
  4: 'Every 4h',
  12: 'Every 12h',
  24: 'Every 24h',
};
export const CLEAN_INTERVAL = {
  2: 'Every 2h',
  4: 'Every 4h',
  12: 'Every 12h',
  24: 'Every 24h',
};

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
  const monster = monsters.find((m) => `${m.id}` === `${monsterId}`);
  const matchFeverOptions = monster?.matchFever;
  if (!matchFeverOptions || !matchFeverOptions.length) return null;
  const { exchangeList } = await fetchMatchList();
  const match = exchangeList.find((opp) => matchFeverOptions.includes(opp.monster_id));
  return match?.slot;
}

export function getTargetPlan(state) {
  const monsterId = state?.monsterId;
  const monster = monsters.find((m) => `${m.id}` === `${monsterId}`);
  const planId = monster?.plan;
  const age = state?.data?.monster?.age;
  if (!age) return {};

  const statLetter = planId?.slice(3, 4);
  const stat = Object.keys(STAT_ID)
    .find((k) => STAT_ID[k].slice(0, 1).toUpperCase() === statLetter);

  let route = routes.L;
  if (age < 4) {
    const divergence = planId?.slice(1, 2);
    route = routes[divergence];
  } else if (age < 5) {
    const divergence = planId?.slice(2, 3);
    route = routes[divergence];
  }

  return {
    id: planId,
    stat,
    ...route,
  };
}

export function getCurrentPlan(state) {
  if (state?.autoPlan) {
    return getTargetPlan(state);
  }
  return {
    stat: state?.stat,
    feedFrequency: state?.feedFrequency,
    cleanFrequency: state?.cleanFrequency,
  };
}

export function getCurrentPlanTimes(state) {
  const { cleanFrequency, feedFrequency } = getCurrentPlan(state);
  const birth = state?.data?.monster?.live_time;

  const nextClean = cleanFrequency === 2 ? state?.data?.next_small_event_timer
    : getNextInterval(birth, cleanFrequency);

  return {
    nextClean,
    nextFeed: getNextInterval(birth, feedFrequency),
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
