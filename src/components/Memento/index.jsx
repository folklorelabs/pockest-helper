import React from 'react';
import cx from 'classnames';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import MEMENTOS from '../../config/mementos.json';
import './index.css';

function AutoPlanControls() {
  const {
    pockestState,
  } = usePockestContext();
  const mementoImg = React.useMemo(() => {
    const hash = pockestState?.data?.monster?.hash;
    if (!hash) return null;
    const curMonId = parseInt(pockestState?.data?.monster?.hash?.slice(0, 4), 10);
    const mementoHash = MEMENTOS.find((h) => h.includes(curMonId));
    if (!mementoHash) return null;
    return `https://www.streetfighter.com/6/buckler/assets/minigame/img/memento/${mementoHash}_memento.png`;
  }, [pockestState?.data?.monster?.hash]);
  return (
    <span
      className={cx('PockestMemento', { 'PockestMemento--missingImg': !mementoImg })}
      style={{ backgroundImage: mementoImg ? `url(${mementoImg})` : 'none' }}
    >
      {pockestState.data.monster.memento_point < pockestState.data.monster.max_memento_point
        ? `(${Math.round((pockestState.data.monster.memento_point / pockestState.data.monster.max_memento_point) * 100)}%)`
        : ''}
    </span>
  );
}

export default AutoPlanControls;
