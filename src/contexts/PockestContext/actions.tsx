import { z } from 'zod';
import fetchAllMonsters from '../../api/fetchAllMonsters';
import fetchAllHashes from '../../api/fetchAllHashes';
import { postDiscordEvo, postDiscordMatch } from '../../api/postDiscord';
import combineDiscordReports from '../../utils/combineDiscordReports';
import {
  getCurrentMonsterLogs,
  getDiscordReportEvoSuccess,
  getDiscordReportMemento,
  isConfirmedMonster,
  getDiscordReportEvoFailure,
  getDiscordReportMatch,
  isMatchDiscovery,
} from './getters';
import daysToMs from '../../utils/daysToMs';
import { getRefreshTimeout, REFRESH_TIMEOUT, setRefreshTimeout } from './state';
import Settings from './types/Settings';
import ACTION_TYPES from './constants/ACTION_TYPES';
import PockestState from './types/PockestState';
import BucklerPotentialMatch from '../../types/BucklerPotentialMatch';
import postClean from '../../api/postClean';
import postTrain from '../../api/postTrain';
import postMatch from '../../api/postMatch';
import postHatch from '../../api/postHatch';
import postCure from '../../api/postCure';
import postFeed from '../../api/postFeed';
import fetchStatus from '../../api/fetchStatus';
import Action from './types/Action';
import statusRefreshPayloadSchema from './schemas/statusRefreshPayloadSchema';
import {
  deathStatusSchema,
  departureStatusSchema,
  evolutionSchema,
  evolutionStatusSchema,
  notFoundStatusSchema,
} from '../../schemas/statusSchema';
import fetchAllEggs from '../../api/fetchAllEggs';

export function pockestLoading(): Action {
  return [ACTION_TYPES.LOADING];
}
export function pockestPause(paused: boolean): Action {
  return [ACTION_TYPES.PAUSE, {
    paused,
  }];
}
export function pockestSettings(settings: Settings): Action {
  return [ACTION_TYPES.SETTINGS, settings];
}
export function pockestPlanSettings(settingsOverride: Settings): Action {
  return [ACTION_TYPES.SETTINGS, settingsOverride];
}

export async function pockestRefresh(pockestState: PockestState): Promise<Action> {
  try {
    // get buckler data and create payload obj
    const data = await fetchStatus();
    let payloadRaw: object = { data };

    const isEvolution = data?.event === 'evolution' || (data?.monster && pockestState?.data?.monster && pockestState?.data?.monster?.hash !== data?.monster?.hash);

    // get sheet data if stale
    const now = Date.now();
    const nextSheetTimestamp = getRefreshTimeout(REFRESH_TIMEOUT.SHEET);
    if (
      !pockestState?.allMonsters || !pockestState?.allHashes // missing data
      || isEvolution // if evolution then we can expect new encylopedia data
      || !nextSheetTimestamp // hasn't run yet
      || now >= nextSheetTimestamp // stale data
    ) {
      setRefreshTimeout(REFRESH_TIMEOUT.SHEET, 20, 10);
      const [
        allMonsters,
        allHashes,
        eggList,
      ] = await Promise.all([
        fetchAllMonsters(),
        fetchAllHashes(),
        fetchAllEggs(),
      ]);
      if (allMonsters) payloadRaw = { ...payloadRaw, allMonsters };
      if (allHashes) payloadRaw = { ...payloadRaw, allHashes };
      if (eggList?.eggs) payloadRaw = { ...payloadRaw, allEggs: eggList.eggs };
      if (typeof eggList?.user_buckler_point === 'number') payloadRaw = { ...payloadRaw, bucklerBalance: eggList.user_buckler_point };
    }

    const payloadParsed = statusRefreshPayloadSchema.safeParse(payloadRaw);
    if (!payloadParsed.success) throw payloadParsed.error;
    const payload = payloadParsed.data;

    // figure out what sort of action to call
    const mergedState = {
      ...pockestState,
      allMonsters: payload?.allMonsters || pockestState?.allMonsters || [],
      allHashes: payload?.allHashes || pockestState?.allHashes || [],
    };
    const confirmedMonster = isConfirmedMonster(mergedState, data);
    if (data?.event === 'death') {
      const deathPayload: z.infer<typeof deathStatusSchema> = data; // hacky way to get around zod type
      return [ACTION_TYPES.REFRESH_DEATH, { ...payloadRaw, data: deathPayload }];
    }
    if (data?.event === 'departure') {
      if (!confirmedMonster) {
        const report = await getDiscordReportMemento(mergedState, data);
        postDiscordEvo(report);
      }
      const departurePayload: z.infer<typeof departureStatusSchema> = data; // hacky way to get around zod type
      return [ACTION_TYPES.REFRESH_DEPARTURE, { ...payloadRaw, data: departurePayload }];
    }
    if (data?.event === 'monster_not_found') {
      const notFoundPayload: z.infer<typeof notFoundStatusSchema> = data; // hacky way to get around zod type
      return [ACTION_TYPES.REFRESH_MONSTER_NOT_FOUND, { ...payloadRaw, data: notFoundPayload }];
    }
    if (isEvolution) {
      // send any useful info to discord
      if (data?.monster?.age && data?.monster?.age >= 5 && !confirmedMonster) {
        const reports = [];
        const evoReport = await getDiscordReportEvoSuccess(mergedState, data);
        reports.push(evoReport);
        const matchingMementoHash = mergedState.allHashes.find((m2) => data?.monster?.memento_hash
          && m2?.id === data?.monster?.memento_hash);
        if (!matchingMementoHash) {
          const mementoReport = await getDiscordReportMemento(mergedState, data);
          reports.push(mementoReport);
        }
        if (reports.length) {
          const report = combineDiscordReports(reports);
          postDiscordEvo(report);
        }
      }
      const evoPayload: z.infer<typeof evolutionStatusSchema> = {
        ...data,
        event: "evolution",
        evolutions: (data as { evolutions?: z.infer<typeof evolutionSchema>[] }).evolutions || [],
      }; // super hacky way to get around zod type
      return [ACTION_TYPES.REFRESH_EVOLUTION_SUCCESS, { ...payloadRaw, data: evoPayload }];
    }
    const isEvoFailureEvent = (() => {
      if (data?.monster?.age && data.monster.age >= 5) return false; // successful evolution already
      if (typeof data?.monster?.live_time === 'number' && Date.now() <= data.monster.live_time + daysToMs(3)) return false; // not evo time yet
      if (pockestState.evolutionFailed || getCurrentMonsterLogs(pockestState, ['evolution_failure'])?.length) return false; // logged already
      return true;
    })();
    if (isEvoFailureEvent) {
      // send any useful info to discord
      const targetMonster = mergedState?.allMonsters
        ?.find((m) => m.planId === pockestState?.planId);
      if (!targetMonster?.confirmed) {
        const report = getDiscordReportEvoFailure(pockestState, data);
        postDiscordEvo(report);
      }
      return [ACTION_TYPES.REFRESH_EVOLUTION_FAILURE, payload];
    }
    return [ACTION_TYPES.REFRESH_STATUS, payload];
  } catch (error) {
    return [ACTION_TYPES.ERROR, `[pockestRefresh] ${error instanceof Error ? error?.message : error}`];
  }
}
export async function pockestFeed(): Promise<Action> {
  try {
    const data = await postFeed();
    const payload = {
      data,
    };
    return [ACTION_TYPES.EVENT_MEAL, payload];
  } catch (error) {
    return [ACTION_TYPES.ERROR, `[pockestFeed] ${error instanceof Error ? error?.message : error}`];
  }
}
export async function pockestCure(): Promise<Action> {
  try {
    const data = await postCure();
    const payload = {
      data,
    };
    return [ACTION_TYPES.EVENT_CURE, payload];
  } catch (error) {
    return [ACTION_TYPES.ERROR, `[pockestCure] ${error instanceof Error ? error?.message : error}`];
  }
}
export async function pockestClean(): Promise<Action> {
  try {
    const data = await postClean();
    const payload = {
      data,
    };
    return [ACTION_TYPES.EVENT_CLEANING, payload];
  } catch (error) {
    return [ACTION_TYPES.ERROR, `[pockestClean] ${error instanceof Error ? error?.message : error}`];
  }
}
export async function pockestTrain(type?: number): Promise<Action> {
  try {
    if (typeof type !== 'number') throw new Error(`Invalid stat type ${type} (${typeof type})`);
    if (type === 0) return [ACTION_TYPES.SKIP_TRAINING];
    const data = await postTrain(type);
    const payload = {
      data,
      args: { type },
    };
    if (data?.event !== 'training') {
      throw new Error(`Buckler Response: ${data?.event}`);
    }
    return [ACTION_TYPES.EVENT_TRAINING, payload];
  } catch (error) {
    return [ACTION_TYPES.ERROR, `[pockestTrain] ${error instanceof Error ? error?.message : error}`];
  }
}
export async function pockestMatch(pockestState: PockestState, match: BucklerPotentialMatch): Promise<Action> {
  try {
    const data = await postMatch(match);
    const payload = {
      data,
      args: { match },
    };
    if (data?.exchangable === false) {
      throw new Error(`Buckler Response: ${data?.event}`);
    }
    const isDisc = isMatchDiscovery(pockestState, data?.exchangeResult);
    if (isDisc) {
      const report = getDiscordReportMatch(
        pockestState,
        data?.exchangeResult,
        payload?.args?.match?.name_en,
      );
      postDiscordMatch(report);
    }
    return [ACTION_TYPES.EVENT_EXCHANGE, payload];
  } catch (error) {
    return [ACTION_TYPES.ERROR, `[pockestMatch] ${error instanceof Error ? error?.message : error}`];
  }
}
export async function pockestSelectEgg(id: number): Promise<Action> {
  try {
    const data = await postHatch(id);
    const payload = {
      data,
      args: { id },
    };
    return [ACTION_TYPES.EVENT_HATCHING, payload];
  } catch (error) {
    return [ACTION_TYPES.ERROR, `[pockestSelectEgg] ${error instanceof Error ? error?.message : error}`];
  }
}
export function pockestClearLog(pockestState: PockestState, logTypes: string[]): Action {
  if (!Array.isArray(logTypes)) {
    return [ACTION_TYPES.ERROR, `[pockestClearLog] logTypes ${logTypes} needs to be an array`];
  }
  const newLog = pockestState?.log
    ?.filter((entry) => !logTypes.includes(entry.logType)
      || !pockestState?.data?.monster?.live_time
      || entry.timestamp >= pockestState?.data?.monster?.live_time);
  return [ACTION_TYPES.SET_LOG, newLog];
}
export function pockestInvalidateSession(): Action {
  return [ACTION_TYPES.INVALIDATE_SESSION];
}
export function pockestErrorHatchSync(errMsg: string): Action {
  return [ACTION_TYPES.ERROR_HATCH_SYNC, errMsg];
}
