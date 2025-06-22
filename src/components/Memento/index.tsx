import React from 'react';
import cx from 'classnames';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';

function Memento() {
  const {
    pockestState,
  } = usePockestContext();
  const mementoImg = React.useMemo(() => {
    const hash = pockestState?.data?.monster?.hash;
    if (!hash) return null;
    const curModIdStr = pockestState?.data?.monster?.hash?.slice(0, 4);
    const curMonId = curModIdStr ? parseInt(curModIdStr, 10) : -1;
    const mementoHash = pockestState?.allHashes?.filter((h) => h.type === 'memento').find((h) => h?.id?.includes(`${curMonId}`));
    if (!mementoHash) return null;
    return `https://www.streetfighter.com/6/buckler/assets/minigame/img/memento/${mementoHash.id}_memento.png`;
  }, [pockestState?.allHashes, pockestState?.data?.monster?.hash]);
  const {
    memento_point = 0,
    max_memento_point = 0,
  } = pockestState?.data?.monster || {};
  return (
    <span
      className={cx('PockestMemento', { 'PockestMemento--missingImg': !mementoImg })}
      style={{ backgroundImage: mementoImg ? `url(${mementoImg})` : 'none' }}
    >
      {memento_point < max_memento_point
        ? `(${Math.round((memento_point / (max_memento_point || 1)) * 100)}%)`
        : ''}
    </span>
  );
}

export default Memento;
