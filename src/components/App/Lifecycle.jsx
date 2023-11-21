import React from 'react';
import {
  pockestLoading,
  pockestClean,
  pockestFeed,
  pockestTrain,
  usePockestContext,
} from '../../contexts/PockestContext';

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
        stat,
      } = pockestState;
      if (loading) return;
      if (autoClean && data?.monster && data?.monster?.garbage > 0) {
        console.log('CLEAN');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestClean());
      }
      if (autoFeed && data?.monster && data?.monster?.stomach < 6) {
        console.log('FEED');
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestFeed());
      }
      const now = new Date();
      const nextTrainingTime = data?.monster?.training_time
        && new Date(data?.monster?.training_time);
      if (autoTrain && nextTrainingTime && now >= nextTrainingTime) {
        console.log('TRAIN', stat);
        pockestDispatch(pockestLoading());
        pockestDispatch(await pockestTrain(stat));
      }
      // const nextMatchTime = data?.monster?.exchange_time
      //   && new Date(data?.monster?.exchange_time);
      // if (nextMatchTime && now >= nextMatchTime) {
      //   console.log('MATCH');
      // }
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [pockestState, pockestDispatch]);
}

export default LifeCycle;
