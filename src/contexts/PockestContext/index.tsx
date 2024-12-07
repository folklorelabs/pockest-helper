import React, { ReactNode } from 'react';

import {
  startStorageSession,
  validateStorageSession,
  getStateFromLocalStorage,
  getStateFromSessionStorage,
  saveStateToLocalStorage,
  saveStateToSessionStorage,
  getRefreshTimeout,
  setRefreshTimeout,
  REFRESH_TIMEOUT,
} from './state';

import { STAT_ID } from '../../constants/stats';
import * as pockestActions from './actions';
import * as pockestGetters from './getters';

import log from '../../utils/log';
import getMatchTimer from '../../utils/getMatchTimer';
import { postDiscordEvo } from '../../api/postDiscord';
import combineDiscordReports from '../../utils/combineDiscordReports';
import fetchMatchList from '../../api/fetchMatchList';
import Action from './types/Action';
import PockestState from './types/PockestState';
import REDUCER from './reducer';
import ACTION_TYPES from './constants/ACTION_TYPES';
import fetchAllEggs from '../../api/fetchAllEggs';
import parsePlanId from '../../utils/parsePlanId';

startStorageSession();
const initialStateFromStorage = getStateFromSessionStorage();
const initialState = initialStateFromStorage || getStateFromLocalStorage();

interface PockestContextInitialState {
  pockestState: PockestState;
  pockestDispatch: React.Dispatch<Action> | null;
}
const PockestContext = React.createContext({
  pockestState: initialState,
  pockestDispatch: null,
} as PockestContextInitialState);

type PockestProviderProps = {
  children: ReactNode;
};

export function PockestProvider({
  children,
}: PockestProviderProps) {
  const [pockestState, pockestDispatch] = React.useReducer(REDUCER, initialState);
  const {
    stat,
    cleanFrequency,
    feedFrequency,
    feedTarget,
  } = React.useMemo(
    () => pockestGetters.getCareSettings(pockestState),
    [pockestState],
  );
  const {
    currentCleanWindow,
    currentFeedWindow,
  } = React.useMemo(
    () => pockestGetters.getCurrentPlanScheduleWindows(pockestState),
    [pockestState],
  );

  // invalidate session if need be
  React.useEffect(() => {
    if (!pockestState?.initialized || pockestState?.invalidSession) return;
    if (!validateStorageSession()) {
      // session invalid, we opened a new tab or something. invalidate the session in state.
      (async () => {
        pockestDispatch(pockestActions.pockestInvalidateSession());
      })();
      return;
    }
    saveStateToLocalStorage(pockestState);
    saveStateToSessionStorage(pockestState);
  }, [pockestState]);

  // detect hatch sync issues
  React.useEffect(() => {
    if (pockestState?.invalidSession // we're in bad state; don't update anything
      || !pockestState?.initialized // we're in bad state; don't update anything
      || pockestState?.error || pockestState?.loading // already recovering elsewhere
      || !pockestState?.data?.monster?.live_time || pockestState?.data?.event === 'hatching' // nothing to desync from
    ) return;
    const bucklerLiveTimestamp = pockestState?.data?.monster?.live_time;
    const stateLiveTimestamp = pockestState?.eggTimestamp;
    if (stateLiveTimestamp && stateLiveTimestamp !== bucklerLiveTimestamp) {
      log('Detected hatch sync', `bucklerLiveTimestamp (${bucklerLiveTimestamp}) !== stateLiveTimestamp (${stateLiveTimestamp})`, pockestState);
      pockestDispatch(pockestActions.pockestErrorHatchSync('Pockest Helper detected a Monster that it did not hatch. Please refrain from manually hatching monsters as this will reduce the effectiveness of Pockest Helper.'));
    }
  }, [pockestState]);

  // refresh status and set next for 5-10 minutes later
  const refreshStatus = React.useCallback(async () => {
    setRefreshTimeout(REFRESH_TIMEOUT.STATUS, 5, 5);
    pockestDispatch(pockestActions.pockestLoading());
    pockestDispatch(await pockestActions.pockestRefresh(pockestState));
  }, [pockestState]);

  // refresh check loop
  React.useEffect(() => {
    if (pockestState?.error
      || pockestState?.loading
      || pockestState?.invalidSession
    ) return () => { };
    const interval = window.setInterval(async () => {
      const now = Date.now();
      const nextStatus = getRefreshTimeout(REFRESH_TIMEOUT.STATUS);
      if (now >= nextStatus) await refreshStatus();
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [pockestState, refreshStatus]);

  // error loop: attempt to re-init every 1-3 minutes if there is an error
  React.useEffect(() => {
    if (!pockestState?.error
      || pockestState?.loading
      || pockestState?.invalidSession
    ) return () => { };
    const interval = window.setInterval(async () => {
      const now = Date.now();
      const nextInit = getRefreshTimeout(REFRESH_TIMEOUT.ERROR);
      if (now >= nextInit) {
        setRefreshTimeout(REFRESH_TIMEOUT.ERROR, 1, 3);
        await refreshStatus();
      }
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [pockestState, refreshStatus]);

  // 5 min timeout for loading -- try recovering
  React.useEffect(() => {
    if (!pockestState?.loading) return () => { };
    const timeout = window.setTimeout(() => {
      refreshStatus();
      pockestDispatch([ACTION_TYPES.ERROR, 'App stuck loading for more than 5 minutes. Recovering.']);
    }, 300000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [pockestState?.loading, refreshStatus]);

  // Queue manager
  React.useEffect(() => {
    if (!pockestState?.initialized
      || pockestState?.loading
      || pockestState?.error
      || pockestState?.invalidSession
    ) return;
    if (!pockestState?.planQueue?.length) return;
    const curQueueItem = pockestState?.planQueue[0];
    const curQueueItemMonster = pockestState?.allMonsters?.find((m) => m?.monster_id === curQueueItem?.monsterId);
    const completedQueueItem = (curQueueItemMonster?.unlock && curQueueItem?.planAge === 5)
      || (curQueueItemMonster?.memento_flg && curQueueItem?.planAge === 6);
    if (completedQueueItem) {
      // remove this item from queue
      pockestDispatch(pockestActions.pockestSettings({ planQueue: pockestState?.planQueue.slice(1) }));
    }
  }, [pockestState]);

  // Lifecycle loop
  React.useEffect(() => {
    if (!pockestState?.initialized
      || pockestState?.loading
      || pockestState?.paused
      || pockestState?.error
      || pockestState?.invalidSession
    ) return () => { };
    const interval = window.setInterval(async () => {
      const {
        data,
        autoPlan,
        autoClean,
        autoFeed,
        autoTrain,
        autoMatch,
        autoCure,
        autoQueue,
      } = pockestState;
      const now = new Date();

      // Pause if autoQueueing and planQueue is empty
      if (autoQueue && !pockestState?.planQueue?.length) {
        pockestDispatch(pockestActions.pockestPause(true));
      }

      // Buy egg if autoQueueing and no existing monster!
      if (autoQueue && !pockestState?.data?.monster) {
        const nextQueueItem = pockestState?.planQueue[0];
        const parsedPlanId = parsePlanId(nextQueueItem?.planId);
        if (typeof parsedPlanId?.planEgg !== 'number') {
          pockestDispatch(pockestActions.pockestPause(true));
          pockestDispatch([ACTION_TYPES.ERROR, `Unable to identify the correct egg to purchase in planId (${nextQueueItem?.planId}). Stopping queue.`]);
          return;
        }
        const { eggs, user_buckler_point } = await fetchAllEggs();
        const eggToPurchase = eggs?.find((e) => e?.id === parsedPlanId?.planEgg);
        if (!eggToPurchase) {
          pockestDispatch([ACTION_TYPES.ERROR, 'Unable to retreive necessary egg info to queue the next monster.']);
          return;
        }
        const eggPrice = eggToPurchase?.buckler_point || Infinity;
        const canAfford = eggToPurchase?.unlock || user_buckler_point >= eggPrice;
        console.log(eggToPurchase?.unlock, user_buckler_point, eggToPurchase, eggPrice, canAfford);
        if (!canAfford) {
          pockestDispatch(pockestActions.pockestPause(true));
          pockestDispatch([ACTION_TYPES.ERROR, 'Cannot afford egg. Stopping queue.']);
          return;
        }
        pockestDispatch(pockestActions.pockestLoading());
        pockestDispatch(await pockestActions.pockestSelectEgg(eggToPurchase.id));
        return;
      }

      // No data! Let's refresh to get things moving.
      // If there is a good reason for no data then refreshing will trigger error or pause.
      if (!data) {
        log('Triggering refresh due to no data found.');
        await refreshStatus();
        return;
      }

      const {
        monster,
      } = data;
      const isStunned = monster?.status === 2;
      const shouldNeglect = monster?.live_time
        ? monster.live_time + pockestGetters.getPlanNeglectOffset(pockestState) <= now.getTime() : false;
      const stunOffset = pockestGetters.getPlanStunOffset(pockestState);
      const shouldLetDie = monster?.live_time && typeof stunOffset === 'number'
        ? monster.live_time + stunOffset <= now.getTime() : false;

      // Small event refresh
      if (data?.next_small_event_timer && now.getTime() > data?.next_small_event_timer) {
        log('Triggering refresh due to next_small_event_timer.');
        await refreshStatus();
        return;
      }

      // Big event refresh
      // no refresh if stunned cause the timer doesn't update and it will loop infinitely
      if (data?.next_big_event_timer && now.getTime() > data?.next_big_event_timer && !isStunned) {
        log('Triggering refresh due to next_big_event_timer.');
        await refreshStatus();
        return;
      }

      // Cure
      if (autoCure && isStunned && !shouldLetDie) {
        log('CURE');
        pockestDispatch(pockestActions.pockestLoading());
        pockestDispatch(await pockestActions.pockestCure());
        return;
      }

      // Clean
      const attemptToClean = autoClean && cleanFrequency
        && (monster && monster?.garbage > 0) && !isStunned
        && !shouldNeglect;
      const inCleanWindow = (!autoPlan && cleanFrequency === 2)
        || (currentCleanWindow && now.getTime() >= currentCleanWindow?.start && now.getTime() <= currentCleanWindow?.end);
      if (attemptToClean && inCleanWindow) {
        log('CLEAN');
        pockestDispatch(pockestActions.pockestLoading());
        pockestDispatch(await pockestActions.pockestClean());
        return;
      }

      // Feed
      const attemptToFeed = autoFeed && feedFrequency
        && (monster && monster?.stomach < feedTarget) && !isStunned
        && !shouldNeglect;
      const inFeedWindow = (!autoPlan && feedFrequency === 4)
        || (currentFeedWindow && now.getTime() >= currentFeedWindow?.start && now.getTime() <= currentFeedWindow?.end);
      if (attemptToFeed && inFeedWindow) {
        log('FEED');
        pockestDispatch(pockestActions.pockestLoading());
        pockestDispatch(await pockestActions.pockestFeed());
        return;
      }

      // Train
      const attemptToTrain = (autoTrain || autoPlan) && monster && stat && !isStunned;
      const nextTrainingTime = monster?.training_time
        && new Date(monster?.training_time);
      const willTrain = attemptToTrain && nextTrainingTime && now >= nextTrainingTime;
      if (willTrain) {
        log(`TRAIN, stat=${STAT_ID[stat]}`);
        pockestDispatch(pockestActions.pockestLoading());
        pockestDispatch(await pockestActions.pockestTrain(stat));
        return;
      }

      // Match
      const attemptToMatch = autoMatch && monster && !isStunned && !willTrain;
      const nextMatchTime = getMatchTimer(pockestState);
      if (attemptToMatch && nextMatchTime && now.getTime() >= nextMatchTime) {
        pockestDispatch(pockestActions.pockestLoading());
        const { exchangeList } = await fetchMatchList();
        if (monster?.age >= 5) {
          // Report missing hashes, names, and stat vals to discord when found on opponents
          const missing = exchangeList.filter((m) => {
            const matchingMonster = pockestState?.allMonsters
              .find((m2) => m2?.monster_id === m?.monster_id);
            return matchingMonster && matchingMonster?.age >= 5 && !matchingMonster?.confirmed;
          });
          if (missing.length) {
            const reportReqs = missing.map((match) => pockestGetters
              .getDiscordReportSighting(pockestState, data, match));
            const reports = await Promise.all(reportReqs);
            const report = combineDiscordReports(reports);
            postDiscordEvo(report);
          }
        }
        const bestMatch = await pockestGetters.getBestMatch(pockestState, exchangeList);
        log(`MATCH, bestMatch=${bestMatch?.name_en}`);
        pockestDispatch(await pockestActions.pockestMatch(pockestState, bestMatch));
      }
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [
    stat,
    cleanFrequency,
    currentCleanWindow,
    currentFeedWindow,
    feedFrequency,
    feedTarget,
    pockestState,
    refreshStatus,
  ]);

  // wrap value in memo so we only re-render when necessary
  const providerValue = React.useMemo(() => ({
    pockestState,
    pockestDispatch,
  }), [pockestState]);

  return (
    <PockestContext.Provider value={providerValue}>
      {children}
    </PockestContext.Provider>
  );
}

export * as pockestActions from './actions';
export * as pockestGetters from './getters';
export function usePockestContext() {
  return React.useContext(PockestContext);
}
