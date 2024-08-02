import {
  ACTIONS,
} from './actions';
import {
  getAutoPlanSettings,
  getLogEntry,
} from './getters';

export default function REDUCER(state, [type, payload]) {
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
        data: payload?.data,
        allMonsters: payload?.allMonsters,
        allHashes: payload?.allHashes,
        ...getAutoPlanSettings({
          ...state,
          data: payload?.data,
        }),
      };
    case ACTIONS.REFRESH:
      return {
        ...state,
        loading: false,
        data: payload,
        cleanTimestamp: (payload?.result?.logType === 'cleaning')
          ? payload?.result?.timestamp : state.cleanTimestamp,
        statLog: (payload?.result?.logType === 'training') ? [
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
            error: `${payload.stack}`,
          },
        ],
      };
    default:
      return { ...state };
  }
}
