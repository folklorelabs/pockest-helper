import React from 'react';
import { STAT_ICON, STAT_ID, usePockestContext } from '../../contexts/PockestContext';
import './index.css';

function Status() {
  const { pockestState } = usePockestContext();
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
        {data?.monster?.[STAT_ID[highestStat]] || '--'}
      </span>
      <span className="Status-item">
        ❤️
        &nbsp;&nbsp;
        {data?.monster?.stomach || '--'}
      </span>
      <span className="Status-item">
        💩
        &nbsp;&nbsp;
        {data?.monster?.garbage || '--'}
      </span>
    </div>
  );
}

export default Status;
