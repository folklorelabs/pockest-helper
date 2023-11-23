import React from 'react';
import { STAT_ICON, STAT_ID } from '../../data/stats';
import { usePockestContext } from '../../contexts/PockestContext';
import { parseDurationStr } from '../../utils/parseDuration';
import useNow from '../../hooks/useNow';
import './index.css';

function Status() {
  const { pockestState } = usePockestContext();
  const now = useNow();
  const { data } = pockestState;
  const highestStat = React.useMemo(() => {
    const availStats = Object.keys(STAT_ID);
    let bestK = availStats[0];
    let bestVal = 0;
    availStats.forEach((k) => {
      const id = STAT_ID[k];
      const v = data?.monster?.[id];
      if (v > bestVal) {
        bestK = k;
        bestVal = v;
      }
    });
    return bestK;
  }, [data]);

  return (
    <div className="Status">
      <span className="Status-item">
        {STAT_ICON[highestStat]}
        {' '}
        {typeof data?.monster?.[STAT_ID[highestStat]] === 'number' ? data?.monster?.[STAT_ID[highestStat]] : '--'}
      </span>
      <span className="Status-item">
        ❤️
        &nbsp;&nbsp;
        {typeof data?.monster?.stomach === 'number' ? data?.monster?.stomach : '--'}
      </span>
      <span className="Status-item">
        💩
        &nbsp;&nbsp;
        {typeof data?.monster?.garbage === 'number' ? data?.monster?.garbage : '--'}
        {data?.next_small_event_timer ? (
          <span className="Status-timer">
            &nbsp;&nbsp;(
            {parseDurationStr(data.next_small_event_timer - now.getTime())}
            )
          </span>
        ) : ''}
      </span>
    </div>
  );
}

export default Status;
