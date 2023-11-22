import React from 'react';
import {
  pockestLoading,
  pockestClean,
  pockestFeed,
  pockestTrain,
  pockestMatch,
  usePockestContext,
  pockestRefresh,
  getCurrentPlan,
  getCurrentPlanScheduleWindows,
  getMonsterMatchFever,
} from '../../contexts/PockestContext';

function LifeCycle() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const {
    cleanFrequency,
  } = React.useMemo(() => getCurrentPlan(pockestState), [pockestState]);
  const {
    currentCleanWindow,
    currentFeedWindow,
  } = React.useMemo(() => getCurrentPlanScheduleWindows(pockestState), [pockestState]);

  const lastRefresh = React.useRef();
  React.useEffect(() => {
    // Random refresh cycle
    const interval = window.setInterval(async () => {
      const now = new Date();
      const {
        data,
      } = pockestState;

      // Small event refresh
      if (now.getTime() > data?.next_small_event_timer) {
        console.log(now.toLocaleString(), 'REFRESH, next_small_event_timer');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestRefresh());
      }

      // Big event refresh
      if (now.getTime() > data?.next_big_event_timer) {
        console.log(now.toLocaleString(), 'REFRESH, next_big_event_timer');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestRefresh());
      }

      // Random refresh
      if (!lastRefresh.current) lastRefresh.current = now; // we have data on the first cycle
      const shouldRandomlyCheck = currentCleanWindow || currentFeedWindow;
      const refreshExpired = (now - lastRefresh.current) > (1000 * 60 * 7);
      if (shouldRandomlyCheck && refreshExpired) {
        lastRefresh.current = now;
        lastRefresh.current += ((Math.random() * 3 * 60 * 1000)); // add extra time just in case
        console.log(now.toLocaleString(), `REFRESH, stale?=${refreshExpired}`);
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestRefresh());
      }
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [currentCleanWindow, currentFeedWindow, pockestDispatch, pockestState]);
  React.useEffect(() => {
    const interval = window.setInterval(async () => {
      const {
        data,
        loading,
        autoPlan,
        autoClean,
        autoFeed,
        autoTrain,
        paused,
        stat,
      } = pockestState;
      if (!data || loading || paused) return;
      const {
        monster,
      } = data;
      const now = new Date();

      // Clean
      const attemptToClean = (autoClean || autoPlan) && (monster && monster?.garbage > 0);
      const inCleanWindow = cleanFrequency === 2
        || (now.getTime() >= currentCleanWindow?.start && now.getTime() <= currentCleanWindow?.end);
      if (attemptToClean && inCleanWindow) {
        console.log(now.toLocaleString(), 'CLEAN');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestClean());
      }

      // Feed
      const attemptToFeed = (autoFeed || autoPlan) && (monster && monster?.garbage > 0);
      const inFeedWindow = cleanFrequency === 2
        || (now.getTime() >= currentFeedWindow?.start && now.getTime() <= currentFeedWindow?.end);
      if (attemptToFeed && inFeedWindow) {
        console.log(now.toLocaleString(), 'FEED');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestFeed());
      }

      // Train
      const attemptToTrain = (autoTrain || autoPlan) && monster;
      const nextTrainingTime = monster?.training_time
        && new Date(monster?.training_time);
      if (attemptToTrain && nextTrainingTime && now >= nextTrainingTime) {
        console.log(now.toLocaleString(), `TRAIN, stat=${stat}`);
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestTrain(stat));
      }

      // Match
      const attemptToMatch = autoPlan && monster;
      const nextMatchTime = monster?.exchange_time
        && new Date(monster?.exchange_time);
      if (attemptToMatch && nextMatchTime && now >= nextMatchTime) {
        const matchSlot = await getMonsterMatchFever(pockestState);
        console.log(now.toLocaleString(), `MATCH, matchSlot=${matchSlot}`);
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestMatch(matchSlot || 1));
      }
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [
    cleanFrequency,
    currentCleanWindow,
    currentFeedWindow,
    pockestDispatch,
    pockestState,
  ]);
}

export default LifeCycle;
