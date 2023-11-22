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
  getCurrentPlanTimes,
  getMonsterMatchFever,
} from '../../contexts/PockestContext';

function LifeCycle() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const {
    stat,
    cleanFrequency,
    feedFrequency,
  } = getCurrentPlan(pockestState);
  const {
    nextClean,
    nextFeed,
  } = getCurrentPlanTimes(pockestState);
  const lastRefresh = React.useRef(null);
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
      } = pockestState;
      if (!data || loading || paused) return;
      const {
        monster,
      } = data;
      const now = new Date();
      if (!lastRefresh.current) lastRefresh.current = now;
      if ((now - lastRefresh.current) > (1000 * 60 * 10)) {
        lastRefresh.current = now;
        console.log(now.toLocaleString(), 'refresh');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestRefresh());
      }
      const attemptToClean = (autoClean || autoPlan) && (monster && monster?.garbage > 0);
      const nextCleanTime = nextFeed && new Date(nextClean);
      if (attemptToClean && (cleanFrequency === 2 || now >= nextCleanTime)) {
        console.log(now.toLocaleString(), 'CLEAN');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestClean());
      }
      const attemptToFeed = (autoFeed || autoPlan) && (monster && monster?.stomach < 6);
      const nextFeedTime = nextFeed && new Date(nextFeed);
      if (attemptToFeed && (feedFrequency === 4 || now >= nextFeedTime)) {
        console.log(now.toLocaleString(), 'FEED');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestFeed());
      }
      const attemptToTrain = (autoTrain || autoPlan) && monster;
      const nextTrainingTime = monster?.training_time
        && new Date(monster?.training_time);
      if (attemptToTrain && nextTrainingTime && now >= nextTrainingTime) {
        console.log(now.toLocaleString(), 'TRAIN', stat);
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestTrain(stat));
      }

      const attemptToMatch = autoPlan && monster;
      const nextMatchTime = monster?.exchange_time
        && new Date(monster?.exchange_time);
      if (attemptToMatch && nextMatchTime && now >= nextMatchTime) {
        const matchSlot = await getMonsterMatchFever(pockestState);
        console.log(now.toLocaleString(), 'MATCH', matchSlot);
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestMatch(matchSlot || 1));
      }
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [pockestState, cleanFrequency, feedFrequency, stat, pockestDispatch, nextFeed, nextClean]);
}

export default LifeCycle;
