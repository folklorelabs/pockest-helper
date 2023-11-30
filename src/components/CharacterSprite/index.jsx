import React from 'react';
import PropTypes from 'prop-types';
import { usePockestContext } from '../../contexts/PockestContext';
import fetchCharAssets from '../../utils/fetchCharAssets';
import HASHES from '../../config/hashes.json';
import './index.css';

function CharacterSprite({ action }) {
  const imgEl = React.useRef();
  const {
    pockestState,
  } = usePockestContext();
  const [characterSprite, setCharacterSprite] = React.useState({});
  const [curFrame, setCurFrame] = React.useState();
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    (async () => {
      const hash = pockestState?.autoPlan ? HASHES.find((h) => h.includes(pockestState?.monsterId))
        : pockestState?.data?.monster?.hash;
      if (!hash) return;
      const newSprite = await fetchCharAssets(hash);
      setCharacterSprite(newSprite || {});
    })();
  }, [pockestState]);
  React.useEffect(() => {
    const frames = characterSprite?.[action];
    if (!frames || loading) return () => {};
    let curIndex = 0;
    const interval = window.setInterval(() => {
      setCurFrame(frames[curIndex]);
      curIndex = curIndex < (frames.length - 1) ? curIndex + 1 : 0;
    }, 400);
    return () => {
      clearInterval(interval);
    };
  }, [action, characterSprite, loading]);
  React.useEffect(() => {
    const frames = characterSprite?.[action];
    setLoading(true);
    const preLoadEl = new Image();
    preLoadEl.onload = () => {
      setCurFrame(frames[0]);
      setLoading(false);
    };
    preLoadEl.src = characterSprite?.image;
  }, [action, characterSprite]);
  if (loading) return '';
  return (
    <div
      className="CharacterSprite"
      style={{
        width: `${curFrame?.frame?.w}px`,
        height: `${curFrame?.frame?.h}px`,
        transform: `translate(calc(${100 - (curFrame?.anchor?.x || 0) * 100}% - ${(curFrame?.frame?.w || 0) / 2}px), ${100 - (curFrame?.anchor?.y || 0) * 100}%)`,
      }}
    >
      <div>
        <div
          ref={imgEl}
          className="CharacterSprite-img"
          style={{
            width: `${curFrame?.rotated ? curFrame?.frame?.h : curFrame?.frame?.w}px`,
            height: `${curFrame?.rotated ? curFrame?.frame?.w : curFrame?.frame?.h}px`,
            transform: `translateX(${curFrame?.rotated ? `${curFrame?.frame?.w}px` : '0'}) rotate(${curFrame?.rotated ? '-90deg' : '0deg'})`,
            backgroundImage: characterSprite?.image && !loading ? `url(${characterSprite?.image})` : 'none',
            backgroundPosition: `-${curFrame?.frame?.x}px -${curFrame?.frame?.y}px`,
            transformOrigin: 'bottom left',
          }}
        />
      </div>
    </div>
  );
}

CharacterSprite.defaultProps = {
  action: 'idle',
};

CharacterSprite.propTypes = {
  action: PropTypes.oneOf([
    'idle',
    'attack',
    'win',
    'down',
  ]),
};

export default CharacterSprite;
