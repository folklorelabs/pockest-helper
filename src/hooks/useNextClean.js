import React from 'react';
import { usePockestContext } from '../contexts/PockestContext';
import getNextInterval from '../utils/getNextInterval';

function useNextClean() {
  const { pockestState } = usePockestContext();
  const { data, cleanInterval } = pockestState;
  const nextClean = React.useMemo(() => {
    if (cleanInterval === 2) return data?.next_small_event_timer;
    return getNextInterval(
      data?.monster?.live_time,
      cleanInterval,
    ).getTime();
  }, [data, cleanInterval]);

  return nextClean;
}

export default useNextClean;
