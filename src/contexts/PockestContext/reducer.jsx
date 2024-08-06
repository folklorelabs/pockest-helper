import log from '../../utils/log';
import {
  getAutoPlanSettings,
  getLogEntry,
} from './getters';

export const ACTIONS = {
  INIT: 'POCKEST_INIT',
  INVALIDATE_SESSION: 'POCKEST_INVALIDATE_SESSION',
  REFRESH: 'POCKEST_REFRESH',
  LOADING: 'POCKEST_LOADING',
  PAUSE: 'POCKEST_PAUSE',
  ERROR: 'POCKEST_ERROR',
  ERROR_HATCH_SYNC: 'POCKEST_ERROR_HATCH_SYNC',
  SETTINGS: 'POCKEST_SETTINGS',
  SET_LOG: 'POCKEST_SET_LOG',
};

export default function REDUCER(state, [type, payload]) {
  log('STATE CHANGE', { state, type, payload });
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
        planAge: payload.planAge ?? state?.planAge,
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
        loading: false,
        data: payload?.data,
        allMonsters: payload?.allMonsters,
        allHashes: payload?.allHashes,
        ...getAutoPlanSettings({
          ...state,
          data: payload?.data,
        }),
      };
    case ACTIONS.REFRESH:
      log();
      return {
        ...state,
        loading: false,
        data: payload,
        eggId: payload?.event === 'hatching' ? payload?.result?.eggType
          : state?.eggId,
        eggTimestamp: payload?.event === 'hatching' ? payload?.result?.monsterBirth
          : state?.eggTimestamp,
        cleanTimestamp: (payload?.event === 'cleaning')
          ? payload?.result?.timestamp : state.cleanTimestamp,
        statLog: (payload?.event === 'training') ? [
          ...state.statLog,
          payload?.result?.type,
        ] : state.statLog,
        log: (payload?.result) ? [
          ...state.log,
          payload?.result,
        ] : state.log,
        ...getAutoPlanSettings({
          ...state,
          data: payload?.data ?? state?.data,
          result: payload?.result,
        }),
      };
    case ACTIONS.SET_LOG:
      return {
        ...state,
        log: payload,
      };
    case ACTIONS.INVALIDATE_SESSION:
      return {
        ...state,
        paused: true,
        invalidSession: true,
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
            error: `${payload}`,
          },
        ],
      };
    case ACTIONS.ERROR_HATCH_SYNC:
      return {
        ...state,
        error: payload,
        eggId: null,
        eggTimestamp: state?.data?.monster?.live_time,
        statLog: state?.log?.filter((entry) => entry.timestamp > state?.data?.monster?.live_time && entry.logType === 'training').map((e) => e.type) ?? [],
        log: [
          ...state.log,
          {
            ...getLogEntry(state),
            logType: 'error',
            error: `${payload}`,
          },
        ],
      };
    default:
      return { ...state };
  }
}
