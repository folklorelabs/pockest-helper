import log from '../../utils/log';
import {
  getAutoPlanSettings,
  getLogEntry,
  getOwnedMementoMonsterIds,
} from './getters';

export const ACTIONS = {
  INIT: 'POCKEST_INIT',
  INVALIDATE_SESSION: 'POCKEST_INVALIDATE_SESSION',
  EVENT_HATCHING: 'POCKEST_EVENT_HATCHING',
  EVENT_CLEANING: 'POCKEST_EVENT_CLEANING',
  EVENT_TRAINING: 'POCKEST_EVENT_TRAINING',
  EVENT_MEAL: 'POCKEST_EVENT_MEAL',
  EVENT_EXCHANGE: 'POCKEST_EVENT_EXCHANGE',
  EVENT_CURE: 'POCKEST_EVENT_CURE',
  REFRESH_STATUS: 'POCKEST_REFRESH_STATUS',
  REFRESH_EVOLUTION_SUCCESS: 'POCKEST_REFRESH_EVOLUTION_SUCCESS',
  REFRESH_EVOLUTION_FAILURE: 'POCKEST_REFRESH_EVOLUTION_FAILURE',
  REFRESH_DEATH: 'POCKEST_REFRESH_DEATH',
  REFRESH_DEPARTURE: 'POCKEST_REFRESH_DEPARTURE',
  REFRESH_MONSTER_NOT_FOUND: 'POCKEST_REFRESH_MONSTER_NOT_FOUND',
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
    case ACTIONS.REFRESH_STATUS:
      return {
        ...state,
        initialized: true,
        allMonsters: payload?.allMonsters || state?.allMonsters,
        allHashes: payload?.allHashes || state?.allHashes,
        loading: false,
        data: payload?.data,
        ...getAutoPlanSettings(state, payload?.data),
      };
    case ACTIONS.SET_LOG:
      return {
        ...state,
        log: payload,
      };
    case ACTIONS.EVENT_HATCHING:
      return {
        ...state,
        loading: false,
        data: payload?.data,
        eggId: payload?.args?.id,
        eggTimestamp: payload?.data?.monster?.live_time,
        evolutionFailed: false,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            eggType: payload?.args?.id,
            timestamp: payload?.data?.monster?.live_time,
          },
        ],
        ...getAutoPlanSettings(state, payload?.data),
      };
    case ACTIONS.EVENT_CLEANING:
      return {
        ...state,
        loading: false,
        data: payload?.data,
        cleanTimestamp: payload?.data?.result?.timestamp,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            ...payload?.data?.cleaning,
            garbageBefore: state?.data?.monster?.garbage,
          },
        ],
        ...getAutoPlanSettings(state, payload?.data),
      };
    case ACTIONS.EVENT_MEAL:
      return {
        ...state,
        loading: false,
        data: payload?.data,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            ...payload?.data?.serving,
            stomach: payload?.data?.monster?.stomach,
          },
        ],
        ...getAutoPlanSettings(state, payload?.data),
      };
    case ACTIONS.EVENT_CURE:
      return {
        ...state,
        loading: false,
        data: payload?.data,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            ...payload?.data?.cure,
          },
        ],
        ...getAutoPlanSettings(state, payload?.data),
      };
    case ACTIONS.EVENT_EXCHANGE:
      return {
        ...state,
        loading: false,
        data: payload?.data,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            ...payload?.data?.exchangeResult,
            target_monster_name_en: payload?.args?.match?.name_en,
          },
        ],
        ...getAutoPlanSettings(state, payload?.data),
      };
    case ACTIONS.EVENT_TRAINING:
      return {
        ...state,
        loading: false,
        data: payload?.data,
        statLog: [
          ...state.statLog,
          payload?.data?.result?.type,
        ],
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            ...payload?.data?.training,
          },
        ],
        ...getAutoPlanSettings(state, payload?.data),
      };
    case ACTIONS.REFRESH_EVOLUTION_SUCCESS:
      return {
        ...state,
        initialized: true,
        allMonsters: payload?.allMonsters || state?.allMonsters,
        allHashes: payload?.allHashes || state?.allHashes,
        loading: false,
        data: payload?.data,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            logType: 'evolution',
            power: payload?.data?.monster?.power,
            speed: payload?.data?.monster?.speed,
            technic: payload?.data?.monster?.technic,
            evolutions: payload?.data?.evolutions || [
              {
                hash: state?.data?.monster?.hash,
                name: state?.data?.monster?.name,
                name_en: state?.data?.monster?.name_en,
              },
              {
                hash: payload?.data?.monster?.hash,
                name: payload?.data?.monster?.name,
                name_en: payload?.data?.monster?.name_en,
              },
            ],
          },
        ],
        ...getAutoPlanSettings(state, payload?.data),
      };
    case ACTIONS.REFRESH_EVOLUTION_FAILURE:
      return {
        ...state,
        initialized: true,
        allMonsters: payload?.allMonsters || state?.allMonsters,
        allHashes: payload?.allHashes || state?.allHashes,
        loading: false,
        data: payload?.data,
        evolutionFailed: true,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            ...getLogEntry(state, payload?.data),
            logType: 'evolution_failure',
            planId: state?.planId,
            power: payload?.data?.monster?.power,
            speed: payload?.data?.monster?.speed,
            technic: payload?.data?.monster?.technic,
            mementosOwned: getOwnedMementoMonsterIds(state),
          },
        ],
        ...getAutoPlanSettings(state, payload?.data),
      };
    case ACTIONS.REFRESH_DEATH:
      return {
        ...state,
        initialized: true,
        allMonsters: payload?.allMonsters || state?.allMonsters,
        allHashes: payload?.allHashes || state?.allHashes,
        loading: false,
        data: payload?.data,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            evolutions: payload?.data?.evolutions,
          },
        ],
        ...getAutoPlanSettings(state, payload?.data),
      };
    case ACTIONS.REFRESH_DEPARTURE:
      return {
        ...state,
        initialized: true,
        allMonsters: payload?.allMonsters || state?.allMonsters,
        allHashes: payload?.allHashes || state?.allHashes,
        loading: false,
        data: payload?.data,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            memento: payload?.data?.memento,
          },
        ],
        ...getAutoPlanSettings(state, payload?.data),
      };
    case ACTIONS.REFRESH_MONSTER_NOT_FOUND:
      return {
        ...state,
        initialized: true,
        allMonsters: payload?.allMonsters || state?.allMonsters,
        allHashes: payload?.allHashes || state?.allHashes,
        loading: false,
        data: payload?.data,
        ...getAutoPlanSettings(state, payload?.data),
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
        evolutionFailed: false,
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
