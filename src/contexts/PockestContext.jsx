import React, {
  createContext,
  useReducer,
  useMemo,
  useEffect,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import getTimeIntervals from '../utils/getTimeIntervals';
import getTotalStats from '../utils/getTotalStats';
import getTargetMonsterPlan, { getCurrentTargetMonsterPlan } from '../utils/getTargetMonsterPlan';
import fetchAllMonsters from '../utils/fetchAllMonsters';
import postDiscord from '../utils/postDiscord';
import isMatchDiscovery from '../utils/isMatchDiscovery';
import getActionResultString from '../utils/getActionResultString';

// STATE
const INITIAL_STATE = {
  data: {},
  allMonsters: [],
  paused: true,
  monsterId: -1,
  autoPlan: true,
  autoFeed: true,
  cleanFrequency: 2,
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

// UTIL
function getStateFromLocalStorage() {
  const stateFromStorage = window.localStorage.getItem('PockestHelper');
  const logFromStorage = window.localStorage.getItem('PockestHelperLog');
  return {
    ...INITIAL_STATE,
    ...(stateFromStorage ? JSON.parse(stateFromStorage) : {}),
    log: (logFromStorage ? JSON.parse(logFromStorage) : INITIAL_STATE.log),
  };
}

function saveStateToLocalStorage(state) {
  const stateToSave = { ...state };
  delete stateToSave?.data;
  delete stateToSave?.initialized;
  delete stateToSave?.paused;
  delete stateToSave?.loading;
  delete stateToSave?.error;
  delete stateToSave?.log;
  delete stateToSave?.allMonsters;
  window.localStorage.setItem('PockestHelper', JSON.stringify(stateToSave));
  window.localStorage.setItem('PockestHelperLog', JSON.stringify(state?.log));
}

// GETTERS

export function getLogEntry(pockestState) {
  return {
    logType: pockestState?.data?.event,
    timestamp: new Date().getTime(),
    monsterId: parseInt(pockestState?.data?.monster?.hash?.split('-')[0] || '-1', 10),
  };
}

export async function fetchMatchList() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/exchange/list');
  const { data } = await response.json();
  return data;
}

export async function fetchPockestStatus() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/status');
  const { data } = await response.json();
  return data;
}

export function getMonsterId(state) {
  const hashId = state?.data?.monster?.hash;
  if (!hashId) return null;
  return parseInt(hashId.slice(0, 4), 10);
}

export async function getBestMatch(state) {
  const monsterId = getMonsterId(state);
  const monster = state?.allMonsters?.find((m) => m.monster_id === monsterId);
  const { exchangeList } = await fetchMatchList();
  const sortedMatches = exchangeList?.map((a) => {
    const aMulti = monster?.matchFever?.includes(a.monster_id) ? 1.5 : 1;
    return {
      ...a,
      expectedPoints: getTotalStats(a) * aMulti,
    };
  })?.sort((a, b) => {
    if (state?.matchPriority === 0) {
      const aSusFever = monster?.matchSusFever?.includes(a.monster_id);
      const bSusFever = monster?.matchSusFever?.includes(b.monster_id);
      if (aSusFever && !bSusFever) return -1;
      if (bSusFever && !aSusFever) return 1;
      const aUnknown = monster?.matchUnknown?.includes(a.monster_id);
      const bUnknown = monster?.matchUnknown?.includes(b.monster_id);
      if (aUnknown && !bUnknown) return -1;
      if (bUnknown && !aUnknown) return 1;
      const aSusNormal = monster?.matchSusNormal?.includes(a.monster_id);
      const bSusNormal = monster?.matchSusNormal?.includes(b.monster_id);
      if (aSusNormal && !bSusNormal) return -1;
      if (bSusNormal && !aSusNormal) return 1;
    }
    if (a.expectedPoints > b.expectedPoints) return -1;
    if (a.expectedPoints < b.expectedPoints) return 1;
    return 0;
  });
  return sortedMatches?.[0];
}

export function getCurrentPlanStats(state) {
  if (state?.autoPlan) {
    return getCurrentTargetMonsterPlan(state);
  }
  return {
    stat: state?.stat,
    cleanFrequency: state?.cleanFrequency,
    feedFrequency: state?.feedFrequency,
    feedTarget: state?.feedTarget,
  };
}

export function getCurrentPlanSchedule(state) {
  const targetPlan = getTargetMonsterPlan(state);
  const birth = state?.data?.monster?.live_time;
  if (!birth) return {};
  const cleanSchedule = state?.autoPlan ? ['planDiv1', 'planDiv2', 'planDiv3']
    .reduce((fullSchedule, div) => {
      const spec = targetPlan[div];
      if (!spec) return fullSchedule;
      const schedule = getTimeIntervals(
        birth + spec.startTime,
        birth + spec.endTime,
        spec.cleanFrequency,
        spec.cleanOffset,
      );
      return [
        ...fullSchedule,
        ...schedule,
      ];
    }, []) : getTimeIntervals(
    birth,
    birth + 7 * 24 * 60 * 60 * 1000,
    state?.cleanFrequency,
    0,
  );
  const feedSchedule = state?.autoPlan ? ['planDiv1', 'planDiv2', 'planDiv3']
    .reduce((fullSchedule, div) => {
      const spec = targetPlan[div];
      if (!spec) return fullSchedule;
      const schedule = getTimeIntervals(
        birth + spec.startTime,
        birth + spec.endTime,
        spec.feedFrequency,
        spec.feedOffset,
      );
      return [
        ...fullSchedule,
        ...schedule,
      ];
    }, []) : getTimeIntervals(
    birth,
    birth + 7 * 24 * 60 * 60 * 1000,
    state?.feedFrequency,
    0,
  );
  return {
    cleanSchedule,
    feedSchedule,
  };
}

const test = getCurrentPlanSchedule({
  monsterId: 4016,
  autoPlan: true,
  cleanFrequency: 2,
  feedFrequency: 4,
  data: {
    monster: {
      live_time: (new Date()).getTime(),
    },
  },
  allMonsters: [
    {
      monster_id: 4006,
      name_en: 'Guile',
      plan: 'W5ALT',
      matchFever: [
        4085,
        4083,
      ],
      matchSusFever: [
        4013,
        4067,
        4082,
      ],
      matchSusNormal: [
        4006,
        4079,
        4124,
        4015,
        4000,
        4003,
        4044,
        4065,
        4086,
        4040,
        4087,
        4074,
        4007,
        4014,
        4096,
        4029,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4035,
        4115,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4079,
      name_en: 'Necalli',
      plan: 'W5ALP',
      matchFever: [
        4015,
      ],
      matchSusFever: [
        4074,
        4096,
        4049,
        4090,
        4092,
        4057,
      ],
      matchSusNormal: [
        4079,
        4124,
        4030,
        4085,
        4000,
        4003,
        4004,
        4044,
        4065,
        4086,
        4040,
        4087,
        4014,
        4009,
        4010,
        4029,
        4018,
        4084,
        4115,
        4120,
        4033,
        4067,
        4051,
        4082,
        4088,
        4002,
        4042,
        4119,
      ],
      matchUnknown: [],
    },
    {
      monster_id: 4124,
      name_en: 'Carlos Miyamoto',
      plan: 'W5ALS',
      matchFever: [
        4006,
        4089,
      ],
      matchSusFever: [
        4049,
        4090,
        4092,
        4067,
        4082,
      ],
      matchSusNormal: [
        4079,
        4124,
        4000,
        4044,
        4065,
        4086,
        4026,
        4012,
        4074,
        4007,
        4014,
        4096,
        4009,
        4029,
      ],
      matchUnknown: [
        4035,
        4115,
        4120,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4015,
      name_en: 'M. Bison',
      plan: 'W5ART',
      matchFever: [
        4065,
        4008,
      ],
      matchSusFever: [
        4074,
        4007,
        4096,
        4033,
      ],
      matchSusNormal: [
        4086,
        4029,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4035,
        4115,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4030,
      name_en: 'Sodom',
      plan: 'W5ARP',
      matchFever: [
        4040,
        4018,
      ],
      matchSusFever: [
        4044,
        4086,
        4033,
      ],
      matchSusNormal: [
        4079,
        4124,
        4015,
        4065,
        4026,
        4087,
        4074,
        4007,
        4014,
        4096,
        4009,
        4010,
        4121,
        4008,
        4029,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4035,
        4115,
        4120,
        4002,
        4042,
      ],
    },
    {
      monster_id: 4085,
      name_en: 'Kimberly',
      plan: 'W5ARS',
      matchFever: [
        4003,
        4022,
      ],
      matchSusFever: [
        4074,
        4007,
        4096,
        4088,
      ],
      matchSusNormal: [
        4079,
        4124,
        4000,
        4044,
        4065,
        4086,
        4026,
        4040,
        4012,
        4014,
        4010,
        4121,
        4008,
        4029,
        4018,
        4049,
        4090,
        4092,
        4033,
        4051,
        4082,
        4002,
        4042,
        4119,
      ],
      matchUnknown: [],
    },
    {
      monster_id: 4000,
      name_en: 'Ryu',
      plan: 'W5BRP',
      matchFever: [
        4030,
        4016,
      ],
      matchSusFever: [
        4049,
        4090,
        4092,
      ],
      matchSusNormal: [
        4044,
        4065,
        4086,
        4026,
        4040,
        4074,
        4014,
        4096,
      ],
      matchUnknown: [
        4115,
        4120,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4003,
      name_en: 'Ken',
      plan: 'W5BRT',
      matchFever: [
        4004,
        4026,
      ],
      matchSusFever: [
        4121,
        4051,
      ],
      matchSusNormal: [
        4086,
        4089,
        4007,
        4014,
        4009,
        4029,
        4049,
        4090,
        4092,
        4120,
        4002,
        4042,
        4119,
      ],
      matchUnknown: [],
    },
    {
      monster_id: 4004,
      name_en: 'Chun-Li',
      plan: 'W5BRS',
      matchFever: [
        4014,
        4029,
      ],
      matchSusFever: [
        4044,
        4086,
        4067,
      ],
      matchSusNormal: [
        4006,
        4065,
        4026,
        4074,
        4016,
        4007,
        4096,
        4010,
        4121,
        4008,
        4018,
        4049,
        4092,
      ],
      matchUnknown: [
        4035,
        4115,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4044,
      name_en: 'Retsu',
      plan: 'W5CRP',
      matchFever: [
        4079,
        4005,
        4084,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4044,
        4086,
        4040,
        4087,
        4074,
        4007,
        4014,
        4096,
        4009,
        4121,
        4013,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4115,
        4120,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4065,
      name_en: 'Juri',
      plan: 'W5CRT',
      matchFever: [
        4000,
        4012,
        4009,
      ],
      matchSusFever: [
        4002,
        4042,
        4119,
      ],
      matchSusNormal: [
        4006,
        4079,
        4124,
        4030,
        4003,
        4044,
        4065,
        4086,
        4026,
        4040,
        4087,
        4074,
        4089,
        4016,
        4007,
        4014,
        4096,
        4010,
        4121,
        4008,
        4049,
        4090,
      ],
      matchUnknown: [],
    },
    {
      monster_id: 4086,
      name_en: 'Manon',
      plan: 'W5CRS',
      matchFever: [
        4124,
        4087,
        4010,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4006,
        4079,
        4044,
        4065,
        4086,
        4040,
        4012,
        4074,
        4007,
        4014,
        4096,
        4009,
        4121,
        4013,
        4029,
        4049,
        4092,
      ],
      matchUnknown: [
        4115,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4026,
      name_en: 'Juli',
      plan: 'G5ALS',
      matchFever: [
        4030,
        4018,
      ],
      matchSusFever: [
        4087,
        4007,
        4096,
      ],
      matchSusNormal: [
        4006,
        4079,
        4015,
        4044,
        4065,
        4086,
        4026,
        4040,
        4012,
        4014,
        4009,
        4010,
        4121,
        4008,
        4013,
        4022,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4074,
        4035,
        4115,
        4120,
        4033,
        4057,
        4051,
        4088,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4040,
      name_en: 'Edi. E',
      plan: 'G5ALP',
      matchFever: [
        4000,
        4012,
        4013,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4044,
        4086,
        4074,
        4014,
        4096,
        4009,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4120,
        4033,
        4057,
        4067,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4087,
      name_en: 'Marisa',
      plan: 'G5ALT',
      matchFever: [
        4006,
        4014,
        4022,
      ],
      matchSusFever: [
        4082,
      ],
      matchSusNormal: [
        4065,
        4086,
        4040,
        4087,
        4074,
        4007,
        4096,
        4009,
        4010,
        4013,
        4029,
        4084,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4115,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4012,
      name_en: 'Balrog',
      plan: 'G5ARP',
      matchFever: [
        4004,
        4083,
      ],
      matchSusFever: [
        4008,
        4082,
      ],
      matchSusNormal: [
        4006,
        4124,
        4015,
        4030,
        4085,
        4003,
        4044,
        4065,
        4086,
        4026,
        4087,
        4012,
        4074,
        4089,
        4007,
        4014,
        4096,
        4010,
        4121,
        4013,
        4018,
        4022,
      ],
      matchUnknown: [
        4009,
        4029,
        4049,
        4090,
        4092,
        4035,
        4115,
        4120,
        4033,
        4057,
        4051,
        4088,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4074,
      name_en: 'Crimson Viper',
      plan: 'G5ART',
      matchFever: [
        4085,
        4089,
      ],
      matchSusFever: [
        4029,
        4049,
        4092,
      ],
      matchSusNormal: [
        4124,
        4044,
        4065,
        4026,
        4074,
        4007,
        4014,
        4096,
        4010,
      ],
      matchUnknown: [
        4120,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4089,
      name_en: 'Lily',
      plan: 'G5ARS',
      matchFever: [
        4015,
        4121,
      ],
      matchSusFever: [
        4074,
        4007,
        4096,
      ],
      matchSusNormal: [
        4006,
        4124,
        4030,
        4044,
        4065,
        4086,
        4040,
        4012,
        4089,
        4005,
        4083,
        4014,
        4009,
        4010,
        4013,
        4029,
        4022,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4035,
        4115,
        4033,
        4067,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4005,
      name_en: 'Cammy',
      plan: 'G5BRS',
      matchFever: [
        4016,
      ],
      matchSusFever: [
        4044,
        4065,
        4086,
      ],
      matchSusNormal: [
        4006,
        4079,
        4000,
        4040,
        4087,
        4012,
        4089,
        4005,
        4083,
        4007,
        4014,
        4096,
        4121,
      ],
      matchUnknown: [
        4009,
        4029,
        4049,
        4092,
        4035,
        4115,
        4120,
        4057,
        4067,
        4051,
        4088,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4016,
      name_en: 'Dee Jay',
      plan: 'G5BRT',
      matchFever: [
        4124,
        4005,
        4010,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4044,
        4065,
        4086,
        4087,
        4074,
        4089,
        4016,
        4083,
        4007,
        4014,
        4096,
        4009,
        4121,
        4013,
        4029,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4035,
        4120,
        4057,
        4119,
      ],
    },
    {
      monster_id: 4083,
      name_en: 'Luke',
      plan: 'G5BRP',
      matchFever: [
        4040,
      ],
      matchSusFever: [
        4044,
        4086,
        4049,
      ],
      matchSusNormal: [
        4015,
        4026,
        4012,
        4074,
        4089,
        4005,
        4016,
        4007,
        4014,
        4096,
        4010,
        4121,
        4013,
      ],
      matchUnknown: [
        4009,
        4029,
        4090,
        4092,
        4035,
        4115,
        4120,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4007,
      name_en: 'Blanka',
      plan: 'G5CRS',
      matchFever: [
        4026,
      ],
      matchSusFever: [
        4065,
        4086,
      ],
      matchSusNormal: [
        4079,
        4015,
        4000,
        4004,
        4040,
        4074,
        4089,
        4083,
        4007,
        4014,
        4096,
        4010,
        4121,
        4013,
        4018,
        4084,
      ],
      matchUnknown: [
        4009,
        4029,
        4049,
        4090,
        4092,
        4115,
        4120,
        4033,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4014,
      name_en: 'Sagat',
      plan: 'G5CRP',
      matchFever: [
        4079,
        4084,
      ],
      matchSusFever: [
        4087,
        4096,
        4082,
      ],
      matchSusNormal: [
        4006,
        4124,
        4030,
        4044,
        4065,
        4086,
        4040,
        4012,
        4089,
        4005,
        4016,
        4083,
        4014,
        4009,
        4010,
        4121,
        4008,
        4013,
        4029,
        4022,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4074,
        4007,
        4035,
        4115,
        4057,
        4067,
        4088,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4096,
      name_en: 'Captain Commando',
      plan: 'G5CRT',
      matchFever: [
        4003,
      ],
      matchSusFever: [
        4074,
        4007,
        4008,
      ],
      matchSusNormal: [
        4006,
        4079,
        4124,
        4030,
        4044,
        4065,
        4086,
        4026,
        4040,
        4012,
        4005,
        4016,
        4083,
        4014,
        4096,
        4010,
        4121,
        4013,
        4084,
      ],
      matchUnknown: [
        4009,
        4049,
        4090,
        4092,
        4035,
        4115,
        4120,
        4067,
        4051,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4009,
      name_en: 'Zangief',
      plan: 'Y5ALP',
      matchFever: [
        4044,
        4090,
      ],
      matchSusFever: [
        4026,
        4040,
      ],
      matchSusNormal: [
        4006,
        4015,
        4085,
        4089,
        4083,
        4009,
        4121,
        4008,
        4029,
        4018,
        4049,
        4092,
      ],
      matchUnknown: [
        4074,
        4007,
        4096,
        4035,
        4115,
        4120,
        4088,
        4002,
        4042,
      ],
    },
    {
      monster_id: 4010,
      name_en: 'E. Honda',
      plan: 'Y5ALT',
      matchFever: [
        4030,
        4005,
      ],
      matchSusFever: [
        4092,
      ],
      matchSusNormal: [
        4006,
        4079,
        4124,
        4015,
        4085,
        4003,
        4004,
        4044,
        4065,
        4086,
        4026,
        4040,
        4087,
        4012,
        4074,
        4007,
        4014,
        4096,
        4009,
        4010,
        4121,
        4008,
        4013,
        4029,
        4018,
        4022,
        4084,
        4049,
        4090,
      ],
      matchUnknown: [
        4035,
        4120,
        4051,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4121,
      name_en: 'Tessa',
      plan: 'Y5ALS',
      matchFever: [
        4084,
      ],
      matchSusFever: [
        4065,
        4086,
        4026,
      ],
      matchSusNormal: [
        4124,
        4015,
        4044,
        4010,
        4121,
        4008,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4074,
        4007,
        4014,
        4096,
        4035,
        4115,
        4120,
        4033,
        4057,
        4067,
        4051,
        4082,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4008,
      name_en: 'Dhalsim',
      plan: 'Y5ARS',
      matchFever: [
        4000,
        4022,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4006,
        4124,
        4030,
        4003,
        4004,
        4044,
        4065,
        4086,
        4089,
        4009,
        4010,
        4121,
        4008,
        4029,
        4018,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4074,
        4007,
        4014,
        4096,
        4035,
        4115,
        4120,
        4033,
        4057,
        4082,
        4088,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4013,
      name_en: 'Vega',
      plan: 'Y5ART',
      matchFever: [
        4124,
        4029,
      ],
      matchSusFever: [
        4040,
        4088,
      ],
      matchSusNormal: [
        4079,
        4030,
        4044,
        4065,
        4086,
        4089,
        4009,
        4010,
        4121,
        4013,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4074,
        4007,
        4014,
        4096,
        4035,
        4115,
        4120,
        4033,
        4057,
        4067,
        4051,
        4082,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4029,
      name_en: 'Rolento',
      plan: 'Y5ARP',
      matchFever: [
        4085,
      ],
      matchSusFever: [
        4087,
        4010,
      ],
      matchSusNormal: [
        4006,
        4015,
        4004,
        4044,
        4065,
        4086,
        4026,
        4040,
        4012,
        4074,
        4083,
        4007,
        4014,
        4096,
        4009,
        4121,
        4008,
        4013,
        4018,
        4022,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4035,
        4115,
        4120,
        4033,
        4057,
        4067,
        4051,
        4082,
        4088,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4018,
      name_en: 'Fei Long',
      plan: 'Y5BRS',
      matchFever: [
        4089,
        4009,
      ],
      matchSusFever: [
        4065,
        4086,
      ],
      matchSusNormal: [
        4079,
        4044,
        4074,
        4005,
        4014,
        4096,
        4010,
        4121,
        4029,
        4022,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4035,
        4115,
        4120,
        4033,
        4057,
        4067,
        4051,
        4082,
        4088,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4022,
      name_en: 'R. Mika',
      plan: 'Y5BRP',
      matchFever: [
        4015,
        4008,
      ],
      matchSusFever: [
        4026,
        4120,
        4002,
        4042,
      ],
      matchSusNormal: [
        4124,
        4044,
        4065,
        4009,
        4121,
        4013,
        4029,
        4022,
        4084,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4074,
        4007,
        4014,
        4096,
      ],
    },
    {
      monster_id: 4084,
      name_en: 'Jamie',
      plan: 'Y5BRT',
      matchFever: [
        4004,
        4018,
      ],
      matchSusFever: [
        4040,
        4014,
      ],
      matchSusNormal: [
        4006,
        4079,
        4124,
        4030,
        4000,
        4003,
        4044,
        4065,
        4086,
        4009,
        4121,
        4029,
        4022,
        4084,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4074,
        4007,
        4096,
        4115,
        4033,
        4057,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4049,
      name_en: 'Dudley',
      plan: 'Y5CRP',
      matchFever: [
        4006,
        4083,
        4121,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4124,
        4015,
        4030,
        4044,
        4065,
        4086,
        4026,
        4040,
        4087,
        4074,
        4007,
        4014,
        4096,
        4009,
        4010,
        4008,
        4013,
        4029,
        4022,
        4084,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4035,
        4115,
        4120,
        4067,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4090,
      name_en: 'JP',
      plan: 'Y5CRS',
      matchFever: [
        4003,
        4016,
        4013,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4124,
        4015,
        4030,
        4085,
        4000,
        4004,
        4044,
        4065,
        4086,
        4026,
        4040,
        4087,
        4012,
        4074,
        4089,
        4007,
        4014,
        4096,
        4009,
        4010,
        4121,
        4008,
        4029,
        4022,
        4049,
        4090,
        4092,
      ],
      matchUnknown: [
        4035,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4092,
      name_en: 'Captain Sawada',
      plan: 'Y5CRT',
      matchFever: [
        4079,
        4012,
      ],
      matchSusFever: [
        4049,
      ],
      matchSusNormal: [
        4006,
        4124,
        4015,
        4030,
        4085,
        4000,
        4004,
        4044,
        4065,
        4086,
        4026,
        4040,
        4074,
        4089,
        4005,
        4083,
        4007,
        4014,
        4096,
        4009,
        4121,
        4008,
        4013,
        4029,
        4018,
        4022,
        4084,
        4090,
        4092,
      ],
      matchUnknown: [
        4035,
        4115,
        4120,
        4033,
        4051,
        4002,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4035,
      name_en: 'Guy',
      plan: 'B5ALT',
      matchFever: [
        4084,
      ],
      matchSusFever: [
        4079,
        4044,
        4086,
        4120,
        4042,
        4119,
      ],
      matchSusNormal: [
        4124,
        4015,
        4004,
        4026,
        4012,
        4009,
        4121,
        4008,
        4013,
        4029,
        4018,
        4090,
        4092,
        4035,
        4002,
      ],
      matchUnknown: [
        4040,
        4087,
        4074,
        4089,
        4083,
        4007,
        4014,
        4096,
      ],
    },
    {
      monster_id: 4115,
      name_en: 'Lilith',
      plan: 'B5ALS',
      matchFever: [
        4051,
      ],
      matchSusFever: [
        4006,
        4065,
        4086,
      ],
      matchSusNormal: [
        4124,
        4004,
        4026,
        4012,
        4016,
        4008,
        4013,
        4084,
        4035,
        4115,
        4120,
        4057,
        4067,
        4088,
        4002,
        4042,
        4119,
      ],
      matchUnknown: [
        4074,
        4083,
        4014,
        4009,
        4010,
        4121,
        4029,
        4018,
        4049,
        4090,
        4092,
      ],
    },
    {
      monster_id: 4120,
      name_en: 'Mai-Ling',
      plan: 'B5ALP',
      matchFever: [
        4026,
      ],
      matchSusFever: [
        4000,
        4057,
      ],
      matchSusNormal: [
        4124,
        4015,
        4004,
        4040,
        4087,
        4012,
        4074,
        4089,
        4005,
        4016,
        4083,
        4007,
        4014,
        4096,
        4008,
        4013,
        4084,
        4035,
        4120,
        4033,
        4051,
        4082,
        4088,
        4002,
      ],
      matchUnknown: [
        4006,
        4030,
        4085,
        4003,
        4044,
        4065,
        4009,
        4121,
        4029,
        4018,
        4022,
        4049,
        4090,
        4092,
        4115,
        4067,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4033,
      name_en: 'Cody',
      plan: 'B5ARP',
      matchFever: [
        4015,
        4008,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4006,
        4079,
        4124,
        4030,
        4004,
        4044,
        4065,
        4086,
        4026,
        4012,
        4016,
        4009,
        4010,
        4121,
        4013,
        4029,
        4022,
        4084,
        4049,
        4090,
        4092,
        4035,
        4033,
        4082,
        4088,
        4002,
      ],
      matchUnknown: [
        4040,
        4087,
        4074,
        4089,
        4005,
        4083,
        4014,
        4096,
        4115,
        4120,
        4067,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4057,
      name_en: 'Urien',
      plan: 'B5ARS',
      matchFever: [
        4088,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4124,
        4015,
        4026,
        4016,
        4008,
        4013,
        4084,
        4035,
        4120,
        4033,
        4057,
        4067,
        4051,
        4082,
        4002,
        4042,
        4119,
      ],
      matchUnknown: [
        4085,
        4044,
        4065,
        4086,
        4040,
        4087,
        4074,
        4089,
        4005,
        4083,
        4007,
        4014,
        4096,
        4010,
        4121,
        4029,
        4018,
        4049,
        4090,
        4092,
      ],
    },
    {
      monster_id: 4067,
      name_en: 'Kolin',
      plan: 'B5ART',
      matchFever: [
        4016,
        4035,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4124,
        4015,
        4004,
        4026,
        4087,
        4012,
        4074,
        4089,
        4005,
        4007,
        4014,
        4096,
        4013,
        4084,
        4115,
        4120,
        4033,
        4067,
        4082,
        4088,
        4002,
        4042,
        4119,
      ],
      matchUnknown: [
        4085,
        4044,
        4065,
        4086,
        4009,
        4121,
        4029,
        4049,
        4090,
        4092,
      ],
    },
    {
      monster_id: 4051,
      name_en: 'Yang',
      plan: 'B5BRS',
      matchFever: [
        4124,
        4012,
        4002,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4006,
        4015,
        4030,
        4000,
        4003,
        4044,
        4065,
        4026,
        4087,
        4074,
        4089,
        4005,
        4016,
        4014,
        4008,
        4013,
        4035,
        4120,
        4057,
        4067,
        4051,
        4088,
        4042,
        4119,
      ],
      matchUnknown: [
        4010,
        4121,
        4029,
        4049,
        4090,
        4092,
      ],
    },
    {
      monster_id: 4082,
      name_en: 'Akira Kazama',
      plan: 'B5BRT',
      matchFever: [],
      matchSusFever: [
        4057,
        4119,
      ],
      matchSusNormal: [
        4124,
        4015,
        4026,
        4012,
        4016,
        4008,
        4013,
        4084,
        4035,
        4033,
        4051,
        4082,
        4002,
      ],
      matchUnknown: [
        4006,
        4030,
        4085,
        4044,
        4065,
        4086,
        4040,
        4087,
        4089,
        4007,
        4014,
        4096,
        4009,
        4010,
        4121,
        4029,
        4018,
        4049,
        4090,
        4092,
        4115,
        4120,
        4042,
      ],
    },
    {
      monster_id: 4088,
      name_en: 'Rashid',
      plan: 'B5BRP',
      matchFever: [
        4004,
        4013,
        4033,
      ],
      matchSusFever: [],
      matchSusNormal: [
        4006,
        4124,
        4030,
        4044,
        4065,
        4086,
        4026,
        4012,
        4016,
        4121,
        4008,
        4029,
        4084,
        4049,
        4090,
        4092,
        4035,
        4120,
        4057,
        4067,
        4051,
        4082,
        4088,
        4042,
        4119,
      ],
      matchUnknown: [
        4040,
        4087,
        4074,
        4007,
        4014,
        4096,
      ],
    },
    {
      monster_id: 4002,
      name_en: 'Violent Ken',
      plan: 'B5CRT',
      matchFever: [],
      matchSusFever: [
        4079,
      ],
      matchSusNormal: [
        4124,
        4026,
        4012,
        4016,
        4084,
        4035,
        4033,
        4082,
        4088,
        4002,
      ],
      matchUnknown: [
        4030,
        4044,
        4065,
        4086,
        4040,
        4087,
        4074,
        4089,
        4005,
        4007,
        4014,
        4096,
        4009,
        4010,
        4121,
        4029,
        4018,
        4022,
        4049,
        4090,
        4092,
        4115,
        4120,
        4067,
        4042,
        4119,
      ],
    },
    {
      monster_id: 4042,
      name_en: 'Joe',
      plan: 'B5CRP',
      matchFever: [],
      matchSusFever: [
        4079,
        4000,
        4067,
        4119,
      ],
      matchSusNormal: [
        4124,
        4015,
        4004,
        4026,
        4012,
        4016,
        4008,
        4013,
        4084,
        4035,
        4033,
        4051,
        4082,
        4088,
        4002,
        4042,
      ],
      matchUnknown: [
        4006,
        4030,
        4085,
        4003,
        4044,
        4065,
        4086,
        4040,
        4087,
        4074,
        4089,
        4005,
        4083,
        4007,
        4014,
        4009,
        4010,
        4121,
        4029,
        4018,
        4022,
        4049,
        4090,
        4092,
      ],
    },
  ],
});
console.log(test?.feedSchedule?.map((s) => `${(new Date(s.start)).toLocaleString()}-${(new Date(s.end)).toLocaleString()}`));

export function getCurrentPlanScheduleWindows(state) {
  const { cleanSchedule, feedSchedule } = getCurrentPlanSchedule(state);
  const now = new Date();
  const nextCleanWindow = cleanSchedule?.find((scheduleWindow) => now < scheduleWindow.start);
  const currentCleanWindow = cleanSchedule?.find(
    (scheduleWindow) => now >= scheduleWindow.start && now <= scheduleWindow.end,
  );
  const nextFeedWindow = feedSchedule?.find((scheduleWindow) => now < scheduleWindow.start);
  const currentFeedWindow = feedSchedule?.find(
    (scheduleWindow) => now >= scheduleWindow.start && now <= scheduleWindow.end,
  );
  return {
    nextCleanWindow,
    currentCleanWindow,
    nextFeedWindow,
    currentFeedWindow,
  };
}

// ACTIONS
export const ACTIONS = {
  INIT: 'POCKEST_INIT',
  REFRESH: 'POCKEST_REFRESH',
  LOADING: 'POCKEST_LOADING',
  PAUSE: 'POCKEST_PAUSE',
  ERROR: 'POCKEST_ERROR',
  SETTINGS: 'POCKEST_SETTINGS',
  SET_LOG: 'POCKEST_SET_LOG',
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
export function pockestAutoPlan({ autoPlan, pockestState, monsterId }) {
  let newSettings = {
    autoPlan,
  };
  if (autoPlan) {
    newSettings = {
      ...newSettings,
      ...getCurrentTargetMonsterPlan(pockestState, monsterId),
      autoClean: true,
      autoFeed: true,
      autoTrain: true,
    };
  }
  if (autoPlan && pockestState?.data?.monster?.age < 5) {
    newSettings.autoMatch = false;
    newSettings.autoCure = false;
  }
  return [ACTIONS.SETTINGS, newSettings];
}
export async function pockestRefresh(pockestState) {
  const data = await fetchPockestStatus();
  if (data && pockestState?.data?.monster.hash !== data?.monster?.hash) {
    data.result = {
      ...getLogEntry({ data }),
      logType: 'age',
      monsterBefore: pockestState?.data?.monster,
    };
  }
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
  data.result = {
    ...getLogEntry({ data }),
    ...data?.serving,
    stomach: data?.monster?.stomach,
  };
  return [ACTIONS.REFRESH, data];
}
export async function pockestCure() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/cure', {
    body: '{"type":1}',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  const { data } = await response.json();
  data.result = {
    ...getLogEntry({ data }),
    ...data?.cure, // TODO: check that this is correct
  };
  return [ACTIONS.REFRESH, data];
}
export async function pockestClean(pockestState) {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/cleaning', {
    body: '{"type":1}',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  const { data } = await response.json();
  data.result = {
    ...getLogEntry({ data }),
    ...data?.cleaning,
    garbageBefore: pockestState?.data?.monster?.garbage,
  };
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
  if (data?.event !== 'training') {
    return [ACTIONS.ERROR, '[pockestTrain] server responded with failure'];
  }
  data.result = {
    ...getLogEntry({ data }),
    ...data?.training,
  };
  return [ACTIONS.REFRESH, data];
}
export async function pockestMatch(pockestState, match) {
  if (match?.slot < 1) {
    return [ACTIONS.ERROR, '[pockestMatch] slot needs to be > 1'];
  }
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/exchange/start', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ slot: match?.slot }),
  });
  const { data } = await response.json();
  if (data?.exchangable === false) {
    return [ACTIONS.ERROR, '[pockestMatch] server responded with failure'];
  }
  data.result = {
    ...getLogEntry({ data }),
    ...data?.exhangeResult,
    totalStats: getTotalStats(data?.monster) + getTotalStats(match),
  };
  const isDisc = isMatchDiscovery(pockestState, data.result);
  if (isDisc) {
    postDiscord(getActionResultString({
      pockestState,
      result: data.result,
      reporting: true,
    }));
  }
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
  data.result = {
    ...getLogEntry({ data }),
    eggType: id,
  };
  return [ACTIONS.REFRESH, data];
}
export function pockestClearLog(pockestState, logTypes) {
  if (!Array.isArray(logTypes)) {
    return [ACTIONS.ERROR, `[pockestClearLog] Unknown logTypes ${logTypes}`];
  }
  const newLog = pockestState?.log?.filter((l) => !logTypes.includes(l.logType));
  return [ACTIONS.SET_LOG, newLog];
}
export async function pockestInit() {
  const [
    allMonsters,
    data,
  ] = await Promise.all([
    fetchAllMonsters(),
    fetchPockestStatus(),
  ]);
  return [ACTIONS.INIT, {
    data,
    allMonsters,
  }];
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
      };
    case ACTIONS.REFRESH:
      return {
        ...state,
        loading: false,
        data: payload,
        log: (payload?.result) ? [
          ...state.log,
          payload?.result,
        ] : state.log,
      };
    case ACTIONS.SET_LOG:
      return {
        ...state,
        log: payload,
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

const initialState = getStateFromLocalStorage();

const PockestContext = createContext({
  pockestState: initialState,
  pockestDispatch: () => { },
});

export function PockestProvider({
  children,
}) {
  const [pockestState, pockestDispatch] = useReducer(REDUCER, initialState);

  useEffect(() => {
    saveStateToLocalStorage(pockestState);
  }, [pockestState]);

  // grab data on init
  useEffect(() => {
    (async () => {
      pockestDispatch(await pockestInit());
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
