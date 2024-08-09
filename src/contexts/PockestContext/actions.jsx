import fetchAllMonsters from '../../utils/fetchAllMonsters';
import fetchAllHashes from '../../utils/fetchAllHashes';
import postDiscord from '../../utils/postDiscord';
import isMatchDiscovery from '../../utils/isMatchDiscovery';
import getMatchReportString from '../../utils/getMatchReportString';
import {
  getAutoPlanSettings,
  fetchPockestStatus,
  getLogEntry,
  getOwnedMementoMonsterNames,
  getCurrentMonsterLogs,
} from './getters';
import { ACTIONS } from './reducer';
import daysToMs from '../../utils/daysToMs';
import getMonsterIdFromHash from '../../utils/getMonsterIdFromHash';
import { getSessionTimeout, setSessionTimeout } from './state';
import log from '../../utils/log';

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
export function pockestPlanSettings(pockestState, settingsOverride) {
  const newSettings = getAutoPlanSettings(pockestState, null, settingsOverride);
  return [ACTIONS.SETTINGS, newSettings];
}

export async function pockestRefresh(pockestState) {
  try {
    const payload = {};

    // get sheet data if stale
    const now = Date.now();
    const nextSheetTimestamp = getSessionTimeout('PockestHelperTimeout-sheetData');
    if (!pockestState?.allMonsters || !pockestState?.allHashes || now >= nextSheetTimestamp) {
      const newNextInit = setSessionTimeout('PockestHelperTimeout-sheetData', 20, 10);
      log(`REFRESH SHEET DATA\nnext @ ${(new Date(newNextInit)).toLocaleString()}`);
      const [
        allMonsters,
        allHashes,
      ] = await Promise.all([
        fetchAllMonsters(),
        fetchAllHashes(),
      ]);
      payload.allMonsters = allMonsters;
      payload.allHashes = allHashes;
    }

    // get buckler data
    const data = await fetchPockestStatus();
    payload.data = data;
    if (data?.event === 'death') return [ACTIONS.REFRESH_DEATH, payload];
    if (data?.event === 'departure') return [ACTIONS.REFRESH_DEPARTURE, payload];
    if (data?.event === 'monster_not_found') return [ACTIONS.REFRESH_MONSTER_NOT_FOUND, payload];
    if (data?.event === 'evolution' || (data?.monster && pockestState?.data?.monster && pockestState?.data?.monster?.hash !== data?.monster?.hash)) {
      // send any useful info to discord
      if (data?.monster?.age >= 5) {
        const reports = [];
        const matchingHash = pockestState?.allHashes.find((m2) => m2?.id === data?.monster?.hash);
        const matchingMonster = pockestState?.allMonsters
          .find((m) => m.monster_id === getMonsterIdFromHash(data?.monster?.hash));
        if (!matchingHash || matchingMonster?.requiredMemento === -1) {
          const mementosOwned = getOwnedMementoMonsterNames(pockestState);
          reports.push(`<⬆️MONSTER> ${data?.monster?.name_en} (${pockestState?.planId})\nHash: ${data?.monster?.hash}\nStat Training: ${pockestState?.statLog.join(', ')}\nStat Totals: P: ${data?.monster?.power}, S: ${data?.monster?.speed}, T: ${data?.monster?.technic}\nOwned Mementos: ${mementosOwned.join(', ')}`);
        }
        const matchingMementoHash = pockestState?.allHashes
          .find((m2) => m2?.id === data?.monster?.memento_hash);
        if (!matchingMementoHash) {
          reports.push(`<🏆MEMENTO> ${data?.monster?.memento_name_en} (${data?.monster?.memento_hash}) from ${data?.monster?.name_en}`);
        }
        if (reports.length) {
          const missingReport = `[Pockest Helper v${import.meta.env.APP_VERSION}]\n${reports.join('\n')}`;
          postDiscord(missingReport, 'DISCORD_EVO_WEBHOOK');
        }
      }

      return [ACTIONS.REFRESH_EVOLUTION_SUCCESS, payload];
    }
    const isEvoFailureEvent = (() => {
      if (data.monster.age >= 5) return false; // successful evolution already
      if (Date.now() <= data.monster.live_time + daysToMs(3)) return false; // not evo time yet
      if (pockestState.evolutionFailed || getCurrentMonsterLogs(pockestState, 'evolution_failure')) return false; // logged already
      return true;
    })();
    if (isEvoFailureEvent) {
      // send any useful info to discord
      const mementosOwned = getOwnedMementoMonsterNames(pockestState);
      const targetMonster = pockestState?.allMonsters
        ?.find((m) => m.planId === pockestState?.planId);
      if (targetMonster.monster_id === -1 || targetMonster?.requiredMemento === -1) {
        const failureReport = `<🤦‍♂️EVO_FAILURE> ${targetMonster.planId}\nStat Training: ${pockestState?.statLog.join(', ')}\nStat Totals: P: ${data?.monster?.power}, S: ${data?.monster?.speed}, T: ${data?.monster?.technic})\nOwned Mementos: ${mementosOwned.join(', ')}`;
        postDiscord(`[Pockest Helper v${import.meta.env.APP_VERSION}]\n${failureReport}`, 'DISCORD_EVO_WEBHOOK');
      }

      return [ACTIONS.REFRESH_EVOLUTION_FAILURE, payload];
    }
    return [ACTIONS.REFRESH_STATUS, payload];
  } catch (error) {
    return [ACTIONS.ERROR, `[pockestRefresh] ${error?.message}`];
  }
}
export async function pockestFeed() {
  try {
    const url = 'https://www.streetfighter.com/6/buckler/api/minigame/serving';
    const response = await fetch(url, {
      body: '{"type":1}',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    const payload = {
      data,
    };
    return [ACTIONS.EVENT_MEAL, payload];
  } catch (error) {
    return [ACTIONS.ERROR, `[pockestFeed] ${error?.message}`];
  }
}
export async function pockestCure() {
  try {
    const url = 'https://www.streetfighter.com/6/buckler/api/minigame/cure';
    const response = await fetch(url, {
      body: '{"type":1}',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    const payload = {
      data,
    };
    return [ACTIONS.EVENT_CURE, payload];
  } catch (error) {
    return [ACTIONS.ERROR, `[pockestCure] ${error?.message}`];
  }
}
export async function pockestClean() {
  try {
    const url = 'https://www.streetfighter.com/6/buckler/api/minigame/cleaning';
    const response = await fetch(url, {
      body: '{"type":1}',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    const payload = {
      data,
    };
    return [ACTIONS.EVENT_CLEANING, payload];
  } catch (error) {
    return [ACTIONS.ERROR, `[pockestClean] ${error?.message}`];
  }
}
export async function pockestTrain(type) {
  try {
    if (type < 1 || type > 3) {
      throw new Error(`Invalid param: type needs to be 1, 2, or 3. Received ${type}.`);
    }
    const url = 'https://www.streetfighter.com/6/buckler/api/minigame/training';
    const response = await fetch(url, {
      body: `{"type":${type}}`,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    const payload = {
      data,
      args: { type },
    };
    if (data?.event !== 'training') {
      throw new Error(`Buckler Response: ${data?.event || data?.message}`);
    }
    return [ACTIONS.EVENT_TRAINING, payload];
  } catch (error) {
    return [ACTIONS.ERROR, `[pockestTrain] ${error?.message}`];
  }
}
export async function pockestMatch(pockestState, match) {
  try {
    if (match?.slot < 1) {
      throw new Error(`Invalid param: slot needs to be > 1, receive ${match}`);
    }
    const url = 'https://www.streetfighter.com/6/buckler/api/minigame/exchange/start';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ slot: match?.slot }),
    });
    if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    const payload = {
      data,
      args: { match },
    };
    if (data?.exchangable === false) {
      throw new Error(`Buckler Response: ${data?.event || data?.message}`);
    }
    const result = {
      ...getLogEntry(pockestState, data),
      ...data?.exchangeResult,
      target_monster_name_en: match?.name_en,
    };
    const isDisc = isMatchDiscovery(pockestState, result);
    if (isDisc) {
      const report = `[Pockest Helper v${import.meta.env.APP_VERSION}]\n${getMatchReportString({
        pockestState,
        result,
      })}`;
      postDiscord(report, 'DISCORD_MATCH_WEBHOOK');
    }
    return [ACTIONS.EVENT_EXCHANGE, payload];
  } catch (error) {
    return [ACTIONS.ERROR, `[pockestMatch] ${error?.message}`];
  }
}
export async function pockestSelectEgg(id) {
  try {
    if (id < 1) throw new Error(`Invalid param: id needs to be > 0, received ${id}`);
    const url = 'https://www.streetfighter.com/6/buckler/api/minigame/eggs';
    const response = await fetch(url, {
      body: `{"id":${id}}`,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
    const resJson = await response.json();
    const data = {
      event: resJson.event,
      ...resJson.data,
    };
    const payload = {
      data,
      args: { id },
    };
    return [ACTIONS.EVENT_HATCHING, payload];
  } catch (error) {
    return [ACTIONS.ERROR, `[pockestSelectEgg] ${error?.message}`];
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
export function pockestInvalidateSession() {
  return [ACTIONS.INVALIDATE_SESSION];
}
export function pockestErrorHatchSync(errMsg) {
  return [ACTIONS.ERROR_HATCH_SYNC, errMsg];
}
