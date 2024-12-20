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
  getRefreshTimeout,
  setRefreshTimeout,
  REFRESH_TIMEOUT,
} from './state';
import REDUCER, { ACTIONS } from './reducer';

import { STAT_ID } from '../../config/stats';
import * as pockestActions from './actions';
import * as pockestGetters from './getters';

import log from '../../utils/log';
import getMatchTimer from '../../utils/getMatchTimer';
import { postDiscordEvo } from '../../utils/postDiscord';
import combineDiscordReports from '../../utils/combineDiscordReports';

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
  useEffect(() => {
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
  useEffect(() => {
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
    ) return () => {};
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
    ) return () => {};
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
    if (!pockestState?.loading) return () => {};
    const timeout = window.setTimeout(() => {
      refreshStatus();
      pockestDispatch([ACTIONS.ERROR], 'App stuck loading for more than 5 minutes. Recovering.');
    }, 300000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [pockestState?.loading, refreshStatus]);

  // Lifecycle loop
  React.useEffect(() => {
    if (!pockestState?.initialized
      || pockestState?.loading
      || pockestState?.paused
      || pockestState?.error
      || pockestState?.invalidSession
    ) return () => {};
    const interval = window.setInterval(async () => {
      const {
        data,
        autoPlan,
        autoClean,
        autoFeed,
        autoTrain,
        autoMatch,
        autoCure,
      } = pockestState;
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
        pockestDispatch(await pockestActions.pockestClean());
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
            const matchingMonster = pockestState?.allMonsters
              .find((m2) => m2?.monster_id === m?.monster_id);
            return matchingMonster?.age >= 5 && !matchingMonster?.confirmed;
          });
          if (missing.length) {
            const reportReqs = missing.map((match) => pockestGetters
              .getDiscordReportSighting(pockestState, data, { match }));
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
  const providerValue = useMemo(() => ({
    pockestState,
    pockestDispatch,
  }), [pockestState]);

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
