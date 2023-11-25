import React from 'react';
import { STAT_ICON, STAT_ID } from '../../config/stats';
import { usePockestContext } from '../../contexts/PockestContext';
import './index.css';

function Status() {
  const { pockestState } = usePockestContext();
  const { data } = pockestState;
  const sortedStats = React.useMemo(() => {
    const availStats = Object.keys(STAT_ID);
    return availStats.sort((a, b) => {
      const aId = STAT_ID[a];
      const aV = data?.monster?.[aId];
      const bId = STAT_ID[b];
      const bV = data?.monster?.[bId];
      return bV - aV;
    });
  }, [data]);
  return (
    <div className="Status">
      <div className="Status-row">
        {sortedStats.map((k) => (
          <span className="Status-item Status-item--stat">
            <span className="Status-icon">{STAT_ICON[k]}</span>
            {' '}
            {typeof data?.monster?.[STAT_ID[k]] === 'number' ? data?.monster?.[STAT_ID[k]] : '--'}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Status;
