import PockestState from './types/PockestState';
import getRandomMinutes from '../../utils/getRandomMinutes';
import log from '../../utils/log';

const INITIAL_STATE: PockestState = {
  monsterId: 4000, // default set to ryu
  planId: '',
  statPlanId: '',
  planAge: 6,
  presetQueue: [],
  data: null,
  allMonsters: [],
  allHashes: [],
  allEggs: [],
  bucklerBalance: 0,
  paused: true,
  eggTimestamp: null,
  eggId: null,
  evolutionFailed: false,
  statLog: [],
  autoPlan: true,
  autoQueue: false,
  autoFeed: true,
  autoMatch: true,
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
  simpleMode: true,
};

export function fixHelperLogFeverBug() {
  const stateLog = window.localStorage.PockestHelperLog && JSON.parse(window.localStorage.PockestHelperLog);
  if (!stateLog) return;
  const fixedStateLog = stateLog.map((entry: { logType: string; is_ferver: boolean; }) => entry.logType !== 'training' ? entry : {
    ...entry,
    is_fever: entry.is_ferver || false,
  });
  window.localStorage.setItem('PockestHelperLog', JSON.stringify(fixedStateLog));

  const sessionState = window.sessionStorage.PockestHelperState && JSON.parse(window.sessionStorage.PockestHelperState);
  if (!sessionState) return;
  const fixedSessionLog = sessionState.log.map((entry: { logType: string; is_ferver: boolean; }) => entry.logType !== 'training' ? entry : {
    ...entry,
    is_fever: entry.is_ferver || false,
  });
  window.sessionStorage.setItem('PockestHelperState', JSON.stringify({
    ...sessionState,
    log: fixedSessionLog,
  }));
}

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

export function getStateFromLocalStorage(): PockestState {
  const stateFromStorage = window.localStorage.getItem('PockestHelper');
  const logFromStorage = window.localStorage.getItem('PockestHelperLog');
  return {
    ...INITIAL_STATE,
    ...(stateFromStorage ? JSON.parse(stateFromStorage) : {}),
    log: (logFromStorage ? JSON.parse(logFromStorage) : INITIAL_STATE.log),
  };
}

export function saveStateToLocalStorage(state: PockestState) {
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

export function getStateFromSessionStorage(): PockestState | null {
  const stateStrFromStorage = window.sessionStorage.getItem('PockestHelperState');
  const stateFromStorage = stateStrFromStorage && JSON.parse(stateStrFromStorage);
  return !stateFromStorage?.invalidSession ? stateFromStorage : null;
}

export function saveStateToSessionStorage(state: PockestState) {
  const stateToSave = JSON.parse(JSON.stringify(state || {}));
  delete stateToSave?.loading; // can get perma-stuck if refresh during load event otherwise
  window.sessionStorage.setItem('PockestHelperState', JSON.stringify(stateToSave));
}

export enum REFRESH_TIMEOUT {
  ERROR = 'PockestHelperTimeout-error',
  STATUS = 'PockestHelperTimeout-statusData',
  SHEET = 'PockestHelperTimeout-sheetData',
};

// remove on load to kick start
Object.values(REFRESH_TIMEOUT).forEach((id) => window.sessionStorage.removeItem(id));

export function setRefreshTimeout(id: string, staticMin: number, dynamicMin: number) {
  const timeout = Date.now() + getRandomMinutes(staticMin, dynamicMin);
  log(`NEXT REFRESH (${id}) @ ${(new Date(timeout)).toLocaleString()}`);
  window.sessionStorage.setItem(id, `${timeout}`);
  return timeout;
}

export function getRefreshTimeout(id: string) {
  const timeoutStr = window.sessionStorage.getItem(id);
  const timeout = timeoutStr && parseInt(timeoutStr, 10);
  return timeout || 0;
}
