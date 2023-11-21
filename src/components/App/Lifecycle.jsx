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
        cleanInterval,
        feedInterval,
        stat,
      } = pockestState;
      if (loading) return;
      const now = new Date();
      const {
        monster,
      } = data;
      const alive = parseDuration(now - new Date(monster.live_time));
      const aliveH = Math.floor(alive.h);
      if (autoClean && monster && monster?.garbage > 0 && aliveH % cleanInterval === 0) {
        console.log(now, 'CLEAN');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestClean());
      }
      if (autoFeed && monster && monster?.stomach < 6 && aliveH % feedInterval === 0) {
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
