import React, {
  createContext,
  useReducer,
  useMemo,
  useEffect,
  useContext,
} from 'react';
import PropTypes from 'prop-types';

import {
  startStorageSession,
  validateStorageSession,
  getStateFromLocalStorage,
  getStateFromSessionStorage,
  saveStateToLocalStorage,
  saveStateToSessionStorage,
} from './state';
import REDUCER from './reducer';

import { STAT_ID } from '../../config/stats';
import * as pockestActions from './actions';
import * as pockestGetters from './getters';

import log from '../../utils/log';
import getMatchTimer from '../../utils/getMatchTimer';
import getRandomMinutes from '../../utils/getRandomMinutes';
import postDiscord from '../../utils/postDiscord';

startStorageSession();
const initialStateFromStorage = getStateFromSessionStorage();
const initialState = initialStateFromStorage || getStateFromLocalStorage();

const PockestContext = createContext({
  pockestState: initialState,
  pockestDispatch: () => { },
});

export function PockestProvider({
  children,
}) {
  const [pockestState, pockestDispatch] = useReducer(REDUCER, initialState);
  const {
    cleanFrequency,
    feedFrequency,
    feedTarget,
  } = React.useMemo(() => pockestGetters.getCurrentPlanStats(pockestState), [pockestState]);
  const {
    currentCleanWindow,
    currentFeedWindow,
  } = React.useMemo(
    () => pockestGetters.getCurrentPlanScheduleWindows(pockestState),
    [pockestState],
  );

  // invalidate session if need be
  useEffect(() => {
    if (pockestState?.invalidSession) return;
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

  useEffect(() => {
    if (pockestState?.error) return;
    const bucklerLiveTimestamp = pockestState?.data?.monster?.live_time;
    const stateLiveTimestamp = pockestState?.eggTimestamp;
    const missingStateTimestamp = bucklerLiveTimestamp && !stateLiveTimestamp;
    const desyncedTimestamp = stateLiveTimestamp && bucklerLiveTimestamp
      && stateLiveTimestamp !== bucklerLiveTimestamp;
    if (missingStateTimestamp || desyncedTimestamp) {
      pockestDispatch(pockestActions.pockestErrorHatchSync('Pockest Helper detected a Monster that it did not hatch. Please refrain from manually hatching monsters as this will reduce the effectiveness of Pockest Helper.'));
    }
  }, [pockestState]);

  // refresh init and set next for 20-30 minutes later
  const refreshInit = React.useCallback(async () => {
    const newNextInit = Date.now() + getRandomMinutes(20, 10);
    const newNextStatus = Date.now() + getRandomMinutes(5, 5);
    window.sessionStorage.setItem('PockestHelperTimeout-init', newNextInit);
    window.sessionStorage.setItem('PockestHelperTimeout-status', newNextStatus);
    log(`REFRESH INIT\nnext status @ ${(new Date(newNextStatus)).toLocaleString()}\nnext init @ ${(new Date(newNextInit)).toLocaleString()}`);
    pockestDispatch(pockestActions.pockestLoading());
    pockestDispatch(await pockestActions.pockestInit());
  }, []);

  // refresh status and set next for 5-10 minutes later
  const refreshStatus = React.useCallback(async () => {
    const newNextStatus = Date.now() + getRandomMinutes(5, 5);
    window.sessionStorage.setItem('PockestHelperTimeout-status', newNextStatus);
    log(`REFRESH STATUS\nnext status @ ${(new Date(newNextStatus)).toLocaleString()}`);
    pockestDispatch(pockestActions.pockestLoading());
    pockestDispatch(await pockestActions.pockestRefresh(pockestState));
  }, [pockestState]);

  // refresh check loop
  React.useEffect(() => {
    let rafId;
    const rafRefresh = async () => {
      const now = Date.now();
      const nextInitStr = window.sessionStorage.getItem('PockestHelperTimeout-init');
      const nextInit = nextInitStr && parseInt(nextInitStr, 10);
      if (now >= nextInit) await refreshInit();
      const nextStatusStr = window.sessionStorage.getItem('PockestHelperTimeout-status');
      const nextStatus = nextStatusStr && parseInt(nextStatusStr, 10);
      if (now >= nextStatus) await refreshStatus();
      rafId = window.requestAnimationFrame(rafRefresh);
    };
    rafRefresh();
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [pockestDispatch, refreshInit, refreshStatus]);

  // error loop: attempt to re-init every 1-3 minutes if there is an error
  React.useEffect(() => {
    if (!pockestState?.error || pockestState?.loading) return () => {};
    let rafId;
    const rafRefresh = async () => {
      const now = Date.now();
      const nextInitStr = window.sessionStorage.getItem('PockestHelperTimeout-error');
      const nextInit = nextInitStr ? parseInt(nextInitStr, 10) : now;
      if (now >= nextInit) {
        const newNextInit = Date.now() + getRandomMinutes(1, 3);
        window.sessionStorage.setItem('PockestHelperTimeout-error', newNextInit);
        log(`REFRESH ERROR\nnext error refresh @ ${(new Date(newNextInit)).toLocaleString()}`);
        await refreshInit();
      }
      rafId = window.requestAnimationFrame(rafRefresh);
    };
    rafRefresh();
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [pockestState, pockestState?.error, refreshInit]);

  // Lifecycle loop
  React.useEffect(() => {
    const interval = window.setInterval(async () => {
      const {
        data,
        loading,
        initialized,
        autoPlan,
        autoClean,
        autoFeed,
        autoTrain,
        autoMatch,
        autoCure,
        paused,
        stat,
        error,
        invalidSession,
      } = pockestState;
      if (!initialized || loading || paused || error || invalidSession) return;
      const now = new Date();

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
        ? monster.live_time + pockestGetters.getPlanNeglectOffset(pockestState) <= now : false;
      const stunOffset = pockestGetters.getPlanStunOffset(pockestState);
      const shouldLetDie = monster?.live_time && typeof stunOffset === 'number'
        ? monster.live_time + stunOffset <= now : false;

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
        || (now.getTime() >= currentCleanWindow?.start && now.getTime() <= currentCleanWindow?.end);
      if (attemptToClean && inCleanWindow) {
        log('CLEAN');
        pockestDispatch(pockestActions.pockestLoading());
        pockestDispatch(await pockestActions.pockestClean(pockestState));
        return;
      }

      // Feed
      const attemptToFeed = autoFeed && feedFrequency
        && (monster && monster?.stomach < feedTarget) && !isStunned
        && !shouldNeglect;
      const inFeedWindow = (!autoPlan && feedFrequency === 4)
        || (now.getTime() >= currentFeedWindow?.start && now.getTime() <= currentFeedWindow?.end);
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
        const { exchangeList } = await pockestGetters.fetchMatchList();
        if (monster?.age >= 5) {
          // Report missing hashes, names, and stat vals to discord when found on opponents
          const missing = exchangeList.filter((m) => {
            const matchingHash = pockestState?.allHashes
              .find((m2) => m2?.id === m?.hash);
            return !matchingHash;
          });
          if (missing.length) {
            const missingStrs = missing.map((m) => `${m.name_en}: ${m.hash} (P: ${m.power}, S: ${m.speed}, T: ${m.technic})`);
            const missingReport = `[Pockest Helper v${import.meta.env.APP_VERSION}] New monsters:\n${missingStrs.join('\n')}`;
            postDiscord(missingReport);
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
    cleanFrequency,
    currentCleanWindow,
    currentFeedWindow,
    feedFrequency,
    feedTarget,
    pockestDispatch,
    pockestState,
    refreshStatus,
  ]);

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

export * as pockestActions from './actions';
export * as pockestGetters from './getters';
export function usePockestContext() {
  return useContext(PockestContext);
}
