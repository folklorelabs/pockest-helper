import React from 'react';
import { STAT_ID } from '../../config/stats';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import log from '../../utils/log';
import getMatchTimer from '../../utils/getMatchTimer';
import getRandomMinutes from '../../utils/getRandomMinutes';
import postDiscord from '../../utils/postDiscord';

function Lifecycle() {
  const { pockestState, pockestDispatch } = usePockestContext();
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

  // refresh init and set next for 20-30 minutes later
  const refreshInit = React.useCallback(async () => {
    const newNextInit = Date.now() + getRandomMinutes(20, 10);
    const newNextStatus = Date.now() + getRandomMinutes(5, 5);
    window.sessionStorage.setItem('PockestHelperTimeout-init', newNextInit);
    window.sessionStorage.setItem('PockestHelperTimeout-status', newNextStatus);
    log(`REFRESH INIT\nnext init @ ${(new Date(newNextInit)).toLocaleString()}\nnext status @ ${(new Date(newNextStatus)).toLocaleString()}`);
    pockestDispatch(pockestActions.pockestLoading());
    pockestDispatch(await pockestActions.pockestInit());
  }, [pockestDispatch]);

  // refresh status and set next for 5-10 minutes later
  const refreshStatus = React.useCallback(async () => {
    const newNextStatus = Date.now() + getRandomMinutes(5, 5);
    window.sessionStorage.setItem('PockestHelperTimeout-status', newNextStatus);
    log(`REFRESH STATUS\nnext status @ ${(new Date(newNextStatus)).toLocaleString()}`);
    pockestDispatch(pockestActions.pockestLoading());
    pockestDispatch(await pockestActions.pockestRefresh(pockestState));
  }, [pockestDispatch, pockestState]);

  // refresh check loop
  React.useEffect(() => {
    let rafId;
    const rafRefresh = async () => {
      const now = Date.now();
      const nextInitStr = window.sessionStorage.getItem('PockestHelperTimeout-init');
      const nextInit = nextInitStr ? parseInt(nextInitStr, 10) : now;
      const nextStatusStr = window.sessionStorage.getItem('PockestHelperTimeout-status');
      const nextStatus = nextStatusStr && parseInt(nextStatusStr, 10);
      const refreshes = [];
      if (now >= nextInit) refreshes.push(refreshInit());
      if (now >= nextStatus) refreshes.push(refreshStatus());
      await Promise.all(refreshes);
      rafId = window.requestAnimationFrame(rafRefresh);
    };
    rafRefresh();
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [pockestDispatch, refreshInit, refreshStatus]);

  React.useEffect(() => {
    if (!pockestState?.error || pockestState?.loading) return () => {};
    const errorTimeoutMs = getRandomMinutes(1, 3);
    const errorTimeout = window.setTimeout(async () => {
      await refreshInit();
    }, errorTimeoutMs);
    return () => {
      window.clearTimeout(errorTimeout);
    };
  }, [pockestState, pockestState?.error, refreshInit]);

  React.useEffect(() => {
    const interval = window.setInterval(async () => {
      const {
        data,
        loading,
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
      if (loading || paused || error || invalidSession) return;
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
}

export default Lifecycle;
