import getTotalStats from '../../utils/getTotalStats';
import fetchAllMonsters from '../../utils/fetchAllMonsters';
import fetchAllHashes from '../../utils/fetchAllHashes';
import postDiscord from '../../utils/postDiscord';
import isMatchDiscovery from '../../utils/isMatchDiscovery';
import getMatchReportString from '../../utils/getMatchReportString';
import {
  getAutoPlanSettings,
  fetchPockestStatus,
  getLogEntry,
} from './getters';

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
export function pockestPlanSettings(pockestState) {
  const newSettings = getAutoPlanSettings(pockestState);
  return [ACTIONS.SETTINGS, newSettings];
}
export async function pockestRefresh(pockestState) {
  try {
    const data = await fetchPockestStatus();
    if (data?.monster && pockestState?.data?.monster?.hash !== data?.monster?.hash) {
      // add evolution to log
      data.result = {
        ...getLogEntry({ data }),
        logType: 'age',
        monsterBefore: pockestState?.data?.monster,
      };
      // send new lvl 5 monster data to discord
      if (data?.monster?.age >= 5) {
        const reports = [];
        const matchingHash = pockestState?.allHashes
          .find((m2) => m2?.id === data?.monster?.hash);
        if (!matchingHash) {
          reports.push(`New monster: ${data?.monster?.name_en}: ${data?.monster?.hash} (P: ${data?.monster?.power}, S: ${data?.monster?.speed}, T: ${data?.monster?.technic})`);
        }
        const matchingMementoHash = pockestState?.allHashes
          .find((m2) => m2?.id === data?.monster?.memento_hash);
        if (!matchingMementoHash) {
          reports.push(`New memento: ${data?.monster?.memento_name_en}: ${data?.monster?.memento_hash} (${data?.monster?.name_en})`);
        }
        if (reports.length) {
          const missingReport = `[Pockest Helper v${import.meta.env.APP_VERSION}]\n${reports.join('\n')}`;
          postDiscord(missingReport);
        }
      }
    }
    if (['death', 'departure'].includes(data?.event)) {
      const monster = data?.monster || pockestState?.data?.monster;
      data.result = getLogEntry({
        data: {
          ...data,
          monster,
        },
      });
    }
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestFeed() {
  try {
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/serving', {
      body: '{"type":1}',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`Network error (${response.status})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    data.result = {
      ...getLogEntry({ data }),
      ...data?.serving,
      stomach: data?.monster?.stomach,
    };
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestCure() {
  try {
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/cure', {
      body: '{"type":1}',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`Network error (${response.status})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    data.result = {
      ...getLogEntry({ data }),
      ...data?.cure, // TODO: check that this is correct
    };
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestClean(pockestState) {
  try {
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/cleaning', {
      body: '{"type":1}',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`Network error (${response.status})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    data.result = {
      ...getLogEntry({ data }),
      ...data?.cleaning,
      garbageBefore: pockestState?.data?.monster?.garbage,
    };
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestTrain(type) {
  try {
    if (type < 1 || type > 3) {
      return [ACTIONS.ERROR, `[pockestTrain] type needs to be 1, 2, or 3. Received ${type}.`];
    }
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/training', {
      body: `{"type":${type}}`,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`Network error (${response.status})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    if (data?.event !== 'training') {
      return [ACTIONS.ERROR, '[pockestTrain] server responded with failure'];
    }
    data.result = {
      ...getLogEntry({ data }),
      ...data?.training,
    };
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestMatch(pockestState, match) {
  try {
    if (match?.slot < 1) {
      return [ACTIONS.ERROR, `[pockestMatch] slot needs to be > 1, receive ${match}`];
    }
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/exchange/start', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ slot: match?.slot }),
    });
    if (!response.ok) throw new Error(`Network error (${response.status})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    if (data?.exchangable === false) {
      return [ACTIONS.ERROR, '[pockestMatch] server responded with failure'];
    }
    data.result = {
      ...getLogEntry({ data }),
      ...data?.exchangeResult,
      totalStats: getTotalStats(data?.monster) + getTotalStats(match),
      target_monster_name_en: match?.name_en,
    };
    const isDisc = isMatchDiscovery(pockestState, data.result);
    if (isDisc) {
      const report = `[Pockest Helper v${import.meta.env.APP_VERSION}]\n${getMatchReportString({
        pockestState,
        result: data.result,
      })}`;
      postDiscord(report);
    }
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export async function pockestSelectEgg(id) {
  try {
    if (id < 1) return [ACTIONS.ERROR, `[pockestSelectEgg] id needs to be > 0, received ${id}`];
    const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/eggs', {
      body: `{"id":${id}}`,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`Network error (${response.status})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    data.result = {
      ...getLogEntry({ data }),
      eggType: id,
      timestamp: data?.monster?.live_time,
    };
    return [ACTIONS.REFRESH, data];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
export function pockestClearLog(pockestState, logTypes) {
  if (!Array.isArray(logTypes)) {
    return [ACTIONS.ERROR, `[pockestClearLog] logTypes ${logTypes} needs to be an array`];
  }
  const newLog = pockestState?.log
    ?.filter((entry) => !logTypes.includes(entry.logType)
    || entry.timestamp >= pockestState?.data?.monster?.live_time);
  return [ACTIONS.SET_LOG, newLog];
}
export async function pockestInit() {
  try {
    const [
      allMonsters,
      allHashes,
      data,
    ] = await Promise.all([
      fetchAllMonsters(),
      fetchAllHashes(),
      fetchPockestStatus(),
    ]);
    return [ACTIONS.INIT, {
      allMonsters,
      allHashes,
      data,
    }];
  } catch (error) {
    return [ACTIONS.ERROR, error];
  }
}
