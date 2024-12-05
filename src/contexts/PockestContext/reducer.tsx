import PockestState from './types/PockestState';
import log from '../../utils/log';
import ACTION_TYPES from './constants/ACTION_TYPES';
import {
  getAutoSettings,
  getLogEntry,
  getOwnedMementoMonsterIds,
} from './getters';
import Action from './types/Action';

export default function REDUCER(state: PockestState, [type, payload]: Action) {
  log('STATE CHANGE', { state, type, payload });
  switch (type) {
    case ACTION_TYPES.LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ACTION_TYPES.SETTINGS:
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
        simpleMode: payload.simpleMode ?? state?.simpleMode,
      };
    case ACTION_TYPES.PAUSE:
      return {
        ...state,
        paused: payload.paused ?? state?.paused,
      };
    case ACTION_TYPES.REFRESH_STATUS:
      return {
        ...state,
        initialized: true,
        allMonsters: payload?.allMonsters || state?.allMonsters,
        allHashes: payload?.allHashes || state?.allHashes,
        loading: false,
        data: payload?.data,
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.SET_LOG:
      return {
        ...state,
        log: payload,
      };
    case ACTION_TYPES.EVENT_HATCHING:
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
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.EVENT_CLEANING:
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
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.EVENT_MEAL:
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
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.EVENT_CURE:
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
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.EVENT_EXCHANGE:
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
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.EVENT_TRAINING:
      return {
        ...state,
        loading: false,
        data: payload?.data,
        statLog: [
          ...state.statLog,
          payload?.data?.training?.type,
        ],
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            ...payload?.data?.training,
          },
        ],
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.REFRESH_EVOLUTION_SUCCESS:
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
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.REFRESH_EVOLUTION_FAILURE:
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
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.REFRESH_DEATH:
      return {
        ...state,
        initialized: true,
        allMonsters: payload?.allMonsters || state?.allMonsters,
        allHashes: payload?.allHashes || state?.allHashes,
        loading: false,
        data: payload?.data,
        eggId: null,
        eggTimestamp: null,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            evolutions: payload?.data?.evolutions,
          },
        ],
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.REFRESH_DEPARTURE:
      return {
        ...state,
        initialized: true,
        allMonsters: payload?.allMonsters || state?.allMonsters,
        allHashes: payload?.allHashes || state?.allHashes,
        loading: false,
        data: payload?.data,
        eggId: null,
        eggTimestamp: null,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            memento: payload?.data?.memento,
          },
        ],
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.REFRESH_MONSTER_NOT_FOUND:
      return {
        ...state,
        initialized: true,
        allMonsters: payload?.allMonsters || state?.allMonsters,
        allHashes: payload?.allHashes || state?.allHashes,
        loading: false,
        data: payload?.data,
        eggId: null,
        eggTimestamp: null,
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.INVALIDATE_SESSION:
      return {
        ...state,
        paused: true,
        invalidSession: true,
      };
    case ACTION_TYPES.ERROR:
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
    case ACTION_TYPES.ERROR_HATCH_SYNC:
      return {
        ...state,
        error: payload,
        eggId: null,
        eggTimestamp: state?.data?.monster?.live_time,
        evolutionFailed: false,
        statLog: state?.log?.filter((entry) => state?.data?.monster?.live_time && entry.timestamp > state?.data?.monster?.live_time && entry.logType === 'training').map((e) => e.type) ?? [],
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
