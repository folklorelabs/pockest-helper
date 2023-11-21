import React from 'react';
import { usePockestContext } from '../contexts/PockestContext';
import getNextInterval from '../utils/getNextInterval';

function useNextFeed() {
  const { pockestState } = usePockestContext();
  const { data, feedInterval } = pockestState;
  const nextFeed = React.useMemo(() => getNextInterval(
    data?.monster?.live_time,
    feedInterval,
  ).getTime(), [data, feedInterval]);

  return nextFeed;
}

export default useNextFeed;
