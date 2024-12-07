import PockestState from './types/PockestState';
import log from '../../utils/log';
import ACTION_TYPES from './constants/ACTION_TYPES';
import {
  getAutoSettings,
  getLogEntry,
  getOwnedMementoMonsterIds,
} from './getters';
import Action from './types/Action';

export default function REDUCER(state: PockestState, [type, payload]: Action): PockestState {
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
        ...getAutoSettings(state, state.data, payload),
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
        allEggs: payload?.allEggs || state?.allEggs,
        bucklerBalance: payload?.bucklerBalance || state?.bucklerBalance,
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
            logType: 'hatching',
            eggType: payload?.args?.id,
            timestamp: payload?.data?.monster?.live_time || Date.now(),
          },
        ],
        ...getAutoSettings(state, payload?.data),
      };
    case ACTION_TYPES.EVENT_CLEANING:
      return {
        ...state,
        loading: false,
        data: payload?.data,
        cleanTimestamp: new Date().getTime(),
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            logType: 'cleaning',
            ...payload?.data?.cleaning,
            garbageBefore: state?.data?.monster?.garbage ?? 0,
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
            logType: 'meal',
            ...payload?.data?.serving,
            stomach: payload?.data?.monster?.stomach || 0,
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
            logType: 'cure',
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
            logType: 'exchange',
            ...payload?.data?.exchangeResult,
            target_monster_name: payload?.args?.match?.name,
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
            logType: 'training',
            ...payload?.data?.training,
            is_ferver: payload?.data?.training?.is_fever,
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
        allEggs: payload?.allEggs || state?.allEggs,
        bucklerBalance: payload?.bucklerBalance || state?.bucklerBalance,
        loading: false,
        data: payload?.data,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            logType: 'evolution',
            power: payload?.data?.monster?.power ?? 0,
            speed: payload?.data?.monster?.speed ?? 0,
            technic: payload?.data?.monster?.technic ?? 0,
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
        allEggs: payload?.allEggs || state?.allEggs,
        bucklerBalance: payload?.bucklerBalance || state?.bucklerBalance,
        loading: false,
        data: payload?.data,
        evolutionFailed: true,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            logType: 'evolution_failure',
            planId: state?.planId,
            power: payload?.data?.monster?.power ?? 0,
            speed: payload?.data?.monster?.speed ?? 0,
            technic: payload?.data?.monster?.technic ?? 0,
            mementosOwned: getOwnedMementoMonsterIds(state),
            evolutions: [
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
    case ACTION_TYPES.REFRESH_DEATH:
      return {
        ...state,
        initialized: true,
        allMonsters: payload?.allMonsters || state?.allMonsters,
        allHashes: payload?.allHashes || state?.allHashes,
        allEggs: payload?.allEggs || state?.allEggs,
        bucklerBalance: payload?.bucklerBalance || state?.bucklerBalance,
        loading: false,
        data: payload?.data,
        eggId: null,
        eggTimestamp: null,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            logType: 'death',
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
        allEggs: payload?.allEggs || state?.allEggs,
        bucklerBalance: payload?.bucklerBalance || state?.bucklerBalance,
        loading: false,
        data: payload?.data,
        eggId: null,
        eggTimestamp: null,
        log: [
          ...state.log,
          {
            ...getLogEntry(state, payload?.data),
            logType: 'departure',
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
        allEggs: payload?.allEggs || state?.allEggs,
        bucklerBalance: payload?.bucklerBalance || state?.bucklerBalance,
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
        statLog: state?.log
          ?.filter((entry) => state?.data?.monster?.live_time && entry.timestamp > state?.data?.monster?.live_time && entry.logType === 'training')
          .map((e) => e.logType === 'training' && e.type)
          .filter((s) => typeof s === 'number')
          ?? [],
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
