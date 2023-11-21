import React, {
  createContext,
  useReducer,
  useMemo,
  useEffect,
  useContext,
} from 'react';
import PropTypes from 'prop-types';

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
  mode: 'simple',
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
  ERROR: 'POCKEST_ERROR',
  SETTINGS: 'POCKEST_SETTINGS',
};
export function pockestLoading() {
  return [ACTIONS.LOADING];
}
export function pockestMode(mode) {
  return [ACTIONS.SETTINGS, {
    ...INITIAL_STATE,
    mode,
  }];
}
export function pockestSettings(settings) {
  const newSettings = {
    ...settings,
  };
  delete newSettings.mode;
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
  });
  const { data } = await response.json();
  return [ACTIONS.REFRESH, data];
}
export async function pockestMatch() {
  return [ACTIONS.ERROR, '[pockestMatch] NYI'];
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
        autoFeed: payload.autoFeed ?? state.autoFeed,
        autoClean: payload.autoClean ?? state.autoClean,
        autoTrain: payload.autoTrain ?? state.autoTrain,
        feedFrequency: payload.feedFrequency ?? state.feedFrequency,
        cleanFrequency: payload.cleanFrequency ?? state.cleanFrequency,
        stat: payload.stat ?? state.stat,
        mode: payload.mode ?? state.mode,
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

const PockestContext = createContext({
  pockestState: INITIAL_STATE,
  pockestDispatch: () => { },
});

export function PockestProvider({
  children,
}) {
  const [pockestState, pockestDispatch] = useReducer(REDUCER, INITIAL_STATE);

  // grab data on init
  useEffect(() => {
    (async () => {
      pockestDispatch([ACTIONS.LOADING]);
      pockestDispatch(await pockestRefresh());
    })();
  }, [pockestDispatch]);

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
