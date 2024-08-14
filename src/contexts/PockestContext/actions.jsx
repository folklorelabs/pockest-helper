import fetchAllMonsters from '../../utils/fetchAllMonsters';
import fetchAllHashes from '../../utils/fetchAllHashes';
import { postDiscordEvo, postDiscordMatch } from '../../utils/postDiscord';
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
import { getRefreshTimeout, REFRESH_TIMEOUT, setRefreshTimeout } from './state';
import { STAT_ID_ABBR } from '../../config/stats';

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
    const nextSheetTimestamp = getRefreshTimeout(REFRESH_TIMEOUT.SHEET);
    if (!pockestState?.allMonsters || !pockestState?.allHashes || now >= nextSheetTimestamp) {
      setRefreshTimeout(REFRESH_TIMEOUT.SHEET, 20, 10);
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
        const matchingMonster = pockestState?.allMonsters
          .filter((m) => m.confirmed)
          .find((m) => m.monster_id === getMonsterIdFromHash(data?.monster?.hash));
        if (!matchingMonster?.confirmed) {
          const mementosOwned = getOwnedMementoMonsterNames(pockestState);
          const header = '\n⬆️ **EVOLUTION SUCCESS** ⬆️';
          const nameStr = `Name: **${data?.monster?.name_en}** (${data?.monster?.name})`;
          const hashStr = `Hash: **${data?.monster?.hash}**`;
          const planIdStr = `**${pockestState?.planId}**`;
          const statPlanStr = `**${pockestState?.statLog?.map((s) => `${STAT_ID_ABBR[s]}`)?.slice(0, 6)?.join('')}**`;
          const planStr = `Plan: ${planIdStr} / ${statPlanStr}`;
          const statsTotal = data?.monster
            ? data.monster.power + data.monster.speed + data.monster.technic : 0;
          const statBreakdownStr = `**P** ${data?.monster?.power} + **S** ${data?.monster?.speed} + **T** ${data?.monster?.technic} = ${statsTotal}`;
          const statsStr = `Stats: ${statBreakdownStr}`;
          const ownedMementosStr = `Owned Mementos: ${mementosOwned.join(', ') || '**None**'}`;
          const report = `${header}\n${nameStr}\n${hashStr}\n${planStr}\n${statsStr}\n${ownedMementosStr}`;
          reports.push(report);
        }
        const matchingMementoHash = pockestState?.allHashes
          .find((m2) => m2?.id === data?.monster?.memento_hash);
        if (!matchingMementoHash) {
          const header = '\n🏆 **MEMENTO** 🏆';
          const fromStr = `From: **${data?.monster?.name_en}** (${data?.monster?.name})`;
          const nameStr = `Name: **${data?.monster?.memento_name_en}** (${data?.monster?.memento_name})`;
          const hashStr = `Hash: **${data?.monster?.memento_hash}**`;
          const report = `${header}\n${fromStr}\n${nameStr}\n${hashStr}`;
          reports.push(report);
        }
        if (reports.length) {
          const missingReport = `${reports.join('\n')}`;
          postDiscordEvo(missingReport);
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
      const targetMonster = pockestState?.allMonsters
        ?.find((m) => m.planId === pockestState?.planId);
      if (!targetMonster?.confirmed) {
        const mementosOwned = getOwnedMementoMonsterNames(pockestState);
        const header = '\n🤦‍♂️ **EVOLUTION FAILURE** 🤦‍♂️';
        const planIdStr = `**${pockestState?.planId}**`;
        const statPlanStr = `**${pockestState?.statLog?.map((s) => `${STAT_ID_ABBR[s]}`)?.slice(0, 6)?.join('')}**`;
        const planStr = `Plan: **${planIdStr}** / **${statPlanStr}**`;
        const statsTotal = data?.monster
          ? data.monster.power + data.monster.speed + data.monster.technic : 0;
        const statBreakdownStr = `**P** ${data?.monster?.power} + **S** ${data?.monster?.speed} + **T** ${data?.monster?.technic} = ${statsTotal}`;
        const statsStr = `Stats: ${statBreakdownStr}`;
        const ownedMementosStr = `Owned Mementos: ${mementosOwned.join(', ') || '**None**'}`;
        const report = `${header}\n${planStr}\n${statsStr}\n${ownedMementosStr}`;
        postDiscordEvo(`${report}`);
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
      const report = `${getMatchReportString({
        pockestState,
        result,
      })}`;
      postDiscordMatch(report);
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
