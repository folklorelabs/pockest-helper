import React from 'react';
import {
  pockestLoading,
  pockestClean,
  pockestFeed,
  pockestTrain,
  usePockestContext,
} from '../../contexts/PockestContext';
import { parseDuration } from '../../utils/parseDuration';

function LifeCycle() {
  const { pockestState, pockestDispatch } = usePockestContext();
  React.useEffect(() => {
    const interval = window.setInterval(async () => {
      const {
        data,
        loading,
        autoClean,
        autoFeed,
        autoTrain,
        cleanFrequency,
        feedFrequency,
        stat,
      } = pockestState;
      if (loading) return;
      const now = new Date();
      const {
        monster,
      } = data;
      const alive = parseDuration(now - new Date(monster.live_time));
      const aliveH = Math.floor(alive.h);
      const attemptToClean = autoClean && monster && monster?.garbage > 0;
      if (attemptToClean && (cleanFrequency === 2 || aliveH % cleanFrequency === 0)) {
        console.log(now, 'CLEAN');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestClean());
      }
      const attemptToFeed = autoFeed && monster && monster?.stomach < 6;
      if (attemptToFeed && (feedFrequency === 4 || aliveH % feedFrequency === 0)) {
        console.log(now, 'FEED');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestFeed());
      }
      const nextTrainingTime = monster?.training_time
        && new Date(monster?.training_time);
      if (autoTrain && nextTrainingTime && now >= nextTrainingTime) {
        console.log(now, 'TRAIN', stat);
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestTrain(stat));
      }
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [pockestState, pockestDispatch]);
}

export default LifeCycle;
