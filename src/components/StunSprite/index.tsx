import React from 'react';
import './index.css';

interface StunSpriteProps {
  animated?: boolean;
}

const ANIMATION_DURATION = 2500;
const DOT_META_SRC = 'https://www.streetfighter.com/6/buckler/assets/minigame/img/dot_asset.json';
const DOT_IMG_SRC = 'https://www.streetfighter.com/6/buckler/assets/minigame/img/dot_asset.png';

type DotMeta = {
  animations: {
    piyo: string[];
  };
  frames: {
    [key: string]: {
      frame: {
        x: number;
        y: number;
        w: number;
        h: number;
      };
      rotated: boolean;
    };
  };
}

function StunSprite({
  animated = true,
}: StunSpriteProps) {
  const imgEl = React.useRef<HTMLDivElement | null>(null);
  const [stunSprite, setStunSprite] = React.useState<DotMeta | null>(null);
  const [curIndex, setCurIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setLoading(true);
    const preLoadEl = new Image();
    preLoadEl.onload = () => {
      setLoading(false);
    };
    preLoadEl.src = DOT_IMG_SRC;
  }, []);
  React.useEffect(() => {
    (async () => {
      const cachedData = window.sessionStorage.getItem('PockestDotAsset');
      if (cachedData) setStunSprite(JSON.parse(cachedData));
      const url = DOT_META_SRC;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
      const newSprite = await response.json();
      window.sessionStorage.setItem('PockestDotAsset', JSON.stringify(newSprite));
      setStunSprite(newSprite || {});
    })();
  }, []);
  React.useEffect(() => {
    if (!stunSprite?.animations?.piyo || loading) return () => { };
    let timeout: number;
    let tempIndex = 0;
    const setFrame = () => {
      const frameIds = stunSprite?.animations?.piyo;
      tempIndex = tempIndex < (frameIds.length - 1) ? tempIndex + 1 : 0;
      setCurIndex(tempIndex);
      if (!animated) return;
      timeout = window.setTimeout(setFrame, ANIMATION_DURATION / frameIds.length);
    };
    setFrame();
    return () => {
      clearTimeout(timeout);
    };
  }, [animated, stunSprite, loading]);
  if (loading) return '';
  return (
    <>
      {Array.from(new Array(5)).map((_val, index) => index * 2).map((offsetIndex) => {
        if (!stunSprite?.animations?.piyo?.length || loading) return '';
        const spriteIndex = (curIndex + offsetIndex) % stunSprite?.animations.piyo.length;
        const frameId = stunSprite?.animations?.piyo?.[spriteIndex];
        const frame = stunSprite?.frames?.[frameId];
        return (
          <div
            key={`StunSprite_${offsetIndex}`}
            className={`StunSprite StunSprite--${frameId?.split('.')[0]}`}
            style={{
              width: `${frame?.frame?.w}px`,
              height: `${frame?.frame?.h}px`,
              transitionDuration: `${animated ? ANIMATION_DURATION / stunSprite?.animations.piyo.length : 0}ms`,
            }}
          >
            <div
              ref={imgEl}
              className="StunSprite-img"
              style={{
                width: `${frame?.rotated ? frame?.frame?.h : frame?.frame?.w}px`,
                height: `${frame?.rotated ? frame?.frame?.w : frame?.frame?.h}px`,
                transform: `translateX(${frame?.rotated ? `${frame?.frame?.w}px` : '0'}) rotate(${frame?.rotated ? '-90deg' : '0deg'})`,
                backgroundImage: !loading ? `url(${DOT_IMG_SRC})` : 'none',
                backgroundPosition: `-${frame?.frame?.x}px -${frame?.frame?.y}px`,
              }}
            />
          </div>
        );
      })}
    </>
  );
}

export default StunSprite;
