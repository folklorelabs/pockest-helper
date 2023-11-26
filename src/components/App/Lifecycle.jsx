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
} from '../../contexts/PockestContext';

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
    const staticOffset = 1000 * 60 * 5; // 5m
    const dynamicMinOffset = Math.round(Math.random() * 1000 * 60 * 5); // 0-5m
    const dynamicSecOffset = Math.round(Math.random() * 1000 * 59); // 0-59s
    return new Date(now.getTime() + staticOffset + dynamicMinOffset + dynamicSecOffset);
  };
  const nextRandomReset = React.useRef(getNextRefresh());
  const refresh = React.useCallback(async () => {
    nextRandomReset.current = getNextRefresh();
    pockestDispatch(pockestLoading());
    pockestDispatch(await pockestRefresh());
  }, [pockestDispatch]);

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
        paused,
        stat,
      } = pockestState;
      if (!data || loading || paused) return;
      const {
        monster,
      } = data;
      const now = new Date();

      // Small event refresh
      if (now.getTime() > data?.next_small_event_timer) {
        console.log(now.toLocaleString(), 'REFRESH, next_small_event_timer');
        await refresh();
        return;
      }

      // Big event refresh
      if (now.getTime() > data?.next_big_event_timer) {
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

      // Clean
      const attemptToClean = (autoClean || autoPlan) && cleanFrequency
        && (monster && monster?.garbage > 0);
      const inCleanWindow = cleanFrequency === 2
        || (now.getTime() >= currentCleanWindow?.start && now.getTime() <= currentCleanWindow?.end);
      if (attemptToClean && inCleanWindow) {
        console.log(now.toLocaleString(), 'CLEAN');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestClean());
      }

      // Feed
      const attemptToFeed = (autoFeed || autoPlan) && feedFrequency
        && (monster && monster?.stomach < feedTarget);
      const inFeedWindow = feedFrequency === 4
        || (now.getTime() >= currentFeedWindow?.start && now.getTime() <= currentFeedWindow?.end);
      if (attemptToFeed && inFeedWindow) {
        console.log(now.toLocaleString(), 'FEED');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestFeed());
      }

      // Train
      const attemptToTrain = (autoTrain || autoPlan) && monster && stat;
      const nextTrainingTime = monster?.training_time
        && new Date(monster?.training_time);
      if (attemptToTrain && nextTrainingTime && now >= nextTrainingTime) {
        console.log(now.toLocaleString(), `TRAIN, stat=${STAT_ID[stat]}`);
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestTrain(stat));
      }

      // Match
      const attemptToMatch = autoMatch && monster;
      const nextMatchTime = monster?.exchange_time
        && new Date(monster?.exchange_time);
      if (attemptToMatch && nextMatchTime && now >= nextMatchTime) {
        const bestMatch = await getBestMatch(pockestState);
        console.log(now.toLocaleString(), `MATCH, bestMatch=${bestMatch?.name_en}`);
        pockestDispatch(pockestLoading());
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
