import React from 'react';
import { usePockestContext } from '../contexts/PockestContext';
import getNextInterval from '../utils/getNextInterval';

function useNextClean() {
  const { pockestState } = usePockestContext();
  const { data, cleanFrequency } = pockestState;
  const nextClean = React.useMemo(() => {
    if (cleanFrequency === 2) return data?.next_small_event_timer;
    return getNextInterval(
      data?.monster?.live_time,
      cleanFrequency,
    ).getTime();
  }, [data, cleanFrequency]);

  return nextClean;
}

export default useNextClean;
