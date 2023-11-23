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
    feedFrequency,
  } = React.useMemo(() => getCurrentPlan(pockestState), [pockestState]);
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
        return;
      }

      // Big event refresh
      if (now.getTime() > data?.next_big_event_timer) {
        console.log(now.toLocaleString(), 'REFRESH, next_big_event_timer');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestRefresh());
        return;
      }

      // Random refresh
      const shouldRandomReset = currentCleanWindow || currentFeedWindow
        || cleanFrequency === 2 || feedFrequency === 4;
      if (shouldRandomReset && now > nextRandomReset.current) {
        nextRandomReset.current = getNextRefresh();
        console.log(now.toLocaleString(), 'REFRESH, random reset');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestRefresh());
      }
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [
    cleanFrequency,
    feedFrequency,
    currentCleanWindow,
    currentFeedWindow,
    pockestDispatch,
    pockestState,
  ]);
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
        return;
      }

      // Feed
      const attemptToFeed = (autoFeed || autoPlan) && (monster && monster?.stomach < 6);
      const inFeedWindow = feedFrequency === 4
        || (now.getTime() >= currentFeedWindow?.start && now.getTime() <= currentFeedWindow?.end);
      if (attemptToFeed && inFeedWindow) {
        console.log(now.toLocaleString(), 'FEED');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestFeed());
        return;
      }

      // Train
      const attemptToTrain = (autoTrain || autoPlan) && monster;
      const nextTrainingTime = monster?.training_time
        && new Date(monster?.training_time);
      if (attemptToTrain && nextTrainingTime && now >= nextTrainingTime) {
        console.log(now.toLocaleString(), `TRAIN, stat=${stat}`);
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestTrain(stat));
        return;
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
