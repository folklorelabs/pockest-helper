import React from 'react';
import { STAT_ID } from '../../config/stats';
import {
  pockestLoading,
  pockestClean,
  pockestFeed,
  pockestTrain,
  pockestMatch,
  usePockestContext,
  pockestRefresh,
  getCurrentPlanStats,
  getCurrentPlanScheduleWindows,
  getBestMatch,
  pockestCure,
  fetchMatchList,
} from '../../contexts/PockestContext';
import getMatchTimer from '../../utils/getMatchTimer';
import getRandomMinutes from '../../utils/getRandomMinutes';
import postDiscord from '../../utils/postDiscord';

function Lifecycle() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const {
    cleanFrequency,
    feedFrequency,
    feedTarget,
  } = React.useMemo(() => getCurrentPlanStats(pockestState), [pockestState]);
  const {
    currentCleanWindow,
    currentFeedWindow,
  } = React.useMemo(() => getCurrentPlanScheduleWindows(pockestState), [pockestState]);

  const getNextRefresh = () => {
    const now = new Date();
    return new Date(now.getTime() + getRandomMinutes(5, 5));
  };
  const nextRandomReset = React.useRef(getNextRefresh());
  const refresh = React.useCallback(async () => {
    nextRandomReset.current = getNextRefresh();
    pockestDispatch(pockestLoading());
    pockestDispatch(await pockestRefresh(pockestState));
  }, [pockestDispatch, pockestState]);
  React.useEffect(() => {
    if (!pockestState?.error || pockestState?.loading) return () => {};
    const errorTimeoutMs = getRandomMinutes(1, 3);
    const errorTimeout = window.setTimeout(async () => {
      await refresh();
    }, errorTimeoutMs);
    return () => {
      window.clearTimeout(errorTimeout);
    };
  }, [refresh, pockestState, pockestState?.error]);
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
      } = pockestState;
      if (!data || loading || paused || error) return;
      const {
        monster,
      } = data;
      const now = new Date();
      const isStunned = monster?.status === 2;

      // Small event refresh
      if (data?.next_small_event_timer && now.getTime() > data?.next_small_event_timer) {
        console.log(now.toLocaleString(), 'REFRESH, next_small_event_timer');
        await refresh();
        return;
      }

      // Big event refresh
      // no refresh if stunned cause the timer doesn't update and it will loop infinitely
      if (data?.next_big_event_timer && now.getTime() > data?.next_big_event_timer && !isStunned) {
        console.log(now.toLocaleString(), 'REFRESH, next_big_event_timer');
        await refresh();
        return;
      }

      // Random refresh
      const shouldRandomReset = currentCleanWindow || currentFeedWindow
        || cleanFrequency === 2 || feedFrequency === 4;
      if (shouldRandomReset && now > nextRandomReset.current) {
        nextRandomReset.current = getNextRefresh();
        console.log(now.toLocaleString(), `REFRESH, random, next @ ${nextRandomReset.current.toLocaleString()}`);
        await refresh();
        return;
      }

      // Cure
      if (autoCure && isStunned) {
        console.log(now.toLocaleString(), 'CURE');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestCure());
      }

      // Clean
      const attemptToClean = (autoClean || autoPlan) && cleanFrequency
        && (monster && monster?.garbage > 0) && !isStunned;
      const inCleanWindow = cleanFrequency === 2
        || (now.getTime() >= currentCleanWindow?.start && now.getTime() <= currentCleanWindow?.end);
      if (attemptToClean && inCleanWindow) {
        console.log(now.toLocaleString(), 'CLEAN');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestClean(pockestState));
      }

      // Feed
      const attemptToFeed = (autoFeed || autoPlan) && feedFrequency
        && (monster && monster?.stomach < feedTarget) && !isStunned;
      const inFeedWindow = feedFrequency === 4
        || (now.getTime() >= currentFeedWindow?.start && now.getTime() <= currentFeedWindow?.end);
      if (attemptToFeed && inFeedWindow) {
        console.log(now.toLocaleString(), 'FEED');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestFeed());
      }

      // Train
      const attemptToTrain = (autoTrain || autoPlan) && monster && stat && !isStunned;
      const nextTrainingTime = monster?.training_time
        && new Date(monster?.training_time);
      const willTrain = attemptToTrain && nextTrainingTime && now >= nextTrainingTime;
      if (willTrain) {
        console.log(now.toLocaleString(), `TRAIN, stat=${STAT_ID[stat]}`);
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestTrain(stat));
      }

      // Report missing hashes, names, and stat vals to discord when found on opponents
      const { exchangeList: el } = await fetchMatchList();
      const missing = el.filter((m) => {
        const matchingHash = pockestState?.allHashes
          .find((m2) => m2?.id === m?.hash);
        return !matchingHash;
      });
      if (missing.length) {
        const missingStrs = missing.map((m) => `${m.name_en}: ${m.hash} (P: ${m.power}, S: ${m.speed}, T: ${m.technic})`);
        const missingReport = `[Pockest Helper v${import.meta.env.APP_VERSION}] New monsters:\n${missingStrs.join('\n')}`;
        postDiscord(missingReport);
      }

      // Match
      const attemptToMatch = autoMatch && monster && !isStunned && !willTrain;
      const nextMatchTime = getMatchTimer(pockestState);
      if (attemptToMatch && nextMatchTime && now.getTime() >= nextMatchTime) {
        pockestDispatch(pockestLoading());
        const { exchangeList } = await fetchMatchList();
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
        const bestMatch = await getBestMatch(pockestState, exchangeList);
        console.log(now.toLocaleString(), `MATCH, bestMatch=${bestMatch?.name_en}`);
        pockestDispatch(await pockestMatch(pockestState, bestMatch));
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
    refresh,
  ]);
}

export default Lifecycle;
