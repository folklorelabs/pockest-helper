import React from 'react';
import { usePockestContext } from '../contexts/PockestContext';
import getNextInterval from '../utils/getNextInterval';

function useNextFeed() {
  const { pockestState } = usePockestContext();
  const { data, feedFrequency } = pockestState;
  const nextFeed = React.useMemo(() => getNextInterval(
    data?.monster?.live_time,
    feedFrequency,
  ).getTime(), [data, feedFrequency]);

  return nextFeed;
}

export default useNextFeed;
