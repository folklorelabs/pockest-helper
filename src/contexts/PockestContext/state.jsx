const INITIAL_STATE = {
  data: {},
  allMonsters: [],
  allHashes: [],
  paused: true,
  monsterId: -1,
  planId: '',
  statPlanId: '',
  statLog: [],
  planAge: 6,
  autoPlan: true,
  autoFeed: true,
  cleanFrequency: 2,
  cleanTimestamp: null,
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

export function getStateFromLocalStorage() {
  const stateFromStorage = window.localStorage.getItem('PockestHelper');
  const logFromStorage = window.localStorage.getItem('PockestHelperLog');
  return {
    ...INITIAL_STATE,
    ...(stateFromStorage ? JSON.parse(stateFromStorage) : {}),
    log: (logFromStorage ? JSON.parse(logFromStorage) : INITIAL_STATE.log),
  };
}

export function saveStateToLocalStorage(state) {
  const stateToSave = JSON.parse(JSON.stringify(state));
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

export function getStateFromSessionStorage() {
  const stateFromStorage = window.sessionStorage.getItem('PockestHelperState');
  return stateFromStorage && JSON.parse(stateFromStorage);
}

export function saveStateToSessionStorage(state) {
  const stateToSave = JSON.parse(JSON.stringify(state));
  window.sessionStorage.setItem('PockestHelperState', JSON.stringify(stateToSave));
}
