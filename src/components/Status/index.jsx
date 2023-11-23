import React from 'react';
import { STAT_ICON, STAT_ID } from '../../data/stats';
import { usePockestContext } from '../../contexts/PockestContext';
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
      <span className="Status-item Status-item--garbage">
        <span className="Status-icon">💩</span>
        &nbsp;&nbsp;
        {typeof data?.monster?.garbage === 'number' ? data?.monster?.garbage : '--'}
      </span>
      <span className="Status-item Status-item--stomach">
        <span className="Status-icon">❤️</span>
        &nbsp;&nbsp;
        {typeof data?.monster?.stomach === 'number' ? data?.monster?.stomach : '--'}
      </span>
      <span className="Status-item Status-item--stat">
        <span className="Status-icon">{STAT_ICON[highestStat]}</span>
        {' '}
        {typeof data?.monster?.[STAT_ID[highestStat]] === 'number' ? data?.monster?.[STAT_ID[highestStat]] : '--'}
      </span>
    </div>
  );
}

export default Status;
