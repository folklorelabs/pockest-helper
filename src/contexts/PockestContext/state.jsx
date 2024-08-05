import getRandomMinutes from '../../utils/getRandomMinutes';

const INITIAL_STATE = {
  data: {},
  allMonsters: [],
  allHashes: [],
  paused: true,
  monsterId: -1,
  eggTimestamp: null,
  eggId: null,
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
  invalidSession: false,
};

export function startStorageSession() {
  const sessionId = window.crypto.randomUUID();
  window.sessionStorage.setItem('PockestHelperSession', sessionId);
  window.localStorage.setItem('PockestHelperSession', sessionId);
}

export function validateStorageSession() {
  const sessionIdSession = window.sessionStorage.getItem('PockestHelperSession');
  const sessionIdLocal = window.localStorage.getItem('PockestHelperSession');
  return sessionIdSession === sessionIdLocal;
}

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
  const stateToSave = JSON.parse(JSON.stringify(state || {}));
  delete stateToSave?.data;
  delete stateToSave?.initialized;
  delete stateToSave?.paused;
  delete stateToSave?.loading;
  delete stateToSave?.error;
  delete stateToSave?.log;
  delete stateToSave?.allMonsters;
  delete stateToSave?.allHashes;
  delete stateToSave?.invalidSession;
  window.localStorage.setItem('PockestHelper', JSON.stringify(stateToSave));
  window.localStorage.setItem('PockestHelperLog', JSON.stringify(state?.log));
}

export function getStateFromSessionStorage() {
  const stateStrFromStorage = window.sessionStorage.getItem('PockestHelperState');
  const stateFromStorage = stateStrFromStorage && JSON.parse(stateStrFromStorage);
  return !stateFromStorage?.invalidSession ? stateFromStorage : null;
}

export function saveStateToSessionStorage(state) {
  window.sessionStorage.setItem('PockestHelperState', JSON.stringify(state));
}

export function setSessionTimeout(id, staticMin, dynamicMin) {
  const timeout = Date.now() + getRandomMinutes(staticMin, dynamicMin);
  window.sessionStorage.setItem(id, timeout);
  return timeout;
}

export function getSessionTimeout(id) {
  const timeoutStr = window.sessionStorage.getItem(id);
  const timeout = timeoutStr && parseInt(timeoutStr, 10);
  return timeout;
}
