import React from 'react';
import { usePockestContext } from '../../contexts/PockestContext';
import fetchCharAssets from '../../api/fetchCharAsset';
import getWeightedRandom from '../../utils/getWeightedRandom';
import BucklerCharAsset from '../../types/BucklerCharAsset';
import BucklerCharFrame from '../../types/BucklerCharFrame';
import './index.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ACTIONS = ['idle', 'attack', 'win', 'down'] as const;

type ActionType = typeof ACTIONS[number];

interface CharacterSpriteProps {
  action?: ActionType;
  animated?: boolean;
  randomAnimations?: ActionType[] | null;
  randomAnimationWeights?: number[] | null;
}

function CharacterSprite({
  action = 'idle',
  animated = true,
  randomAnimations = null,
  randomAnimationWeights = null,
}: CharacterSpriteProps) {
  const imgEl = React.useRef<HTMLDivElement>(null);
  const {
    pockestState,
  } = usePockestContext();
  const [characterSprite, setCharacterSprite] = React.useState<BucklerCharAsset | null>(null);
  const [curFrame, setCurFrame] = React.useState<BucklerCharFrame | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    (async () => {
      const hash = pockestState?.data?.monster?.hash;
      if (!hash) return;
      const newSprite = await fetchCharAssets(hash);
      setCharacterSprite(newSprite || null);
    })();
  }, [pockestState]);
  React.useEffect(() => {
    if (!characterSprite || loading) return () => { };
    let timeout: number;
    let curIndex = 0;
    let curAction: ActionType = action;
    const setFrame = () => {
      const frameKey = Object.keys(characterSprite).find((s): s is keyof BucklerCharAsset => s.includes(curAction));
      const frames: BucklerCharFrame[] = frameKey ? (characterSprite[frameKey] as unknown as BucklerCharFrame[]) : [];
      setCurFrame(frames[curIndex]);
      curIndex = curIndex < (frames.length - 1) ? curIndex + 1 : 0;
      const endOfAnim = curIndex === frames.length - 1;
      if (randomAnimations && endOfAnim) {
        const nextRandActionIndex = randomAnimationWeights
          ? getWeightedRandom(randomAnimationWeights)
          : Math.floor(Math.random() * randomAnimations.length);
        curAction = randomAnimations[nextRandActionIndex];
      }
      const ms = endOfAnim ? 200 + Math.random() * 500 : 200;
      if (!animated) return;
      timeout = window.setTimeout(setFrame, ms);
    };
    setFrame();
    return () => {
      clearTimeout(timeout);
    };
  }, [action, animated, characterSprite, loading, randomAnimationWeights, randomAnimations]);
  React.useEffect(() => {
    if (!characterSprite?.meta?.image) return;
    const frameKey = Object.keys(characterSprite).find((s): s is keyof BucklerCharAsset => s.includes(action));
    const frames: BucklerCharFrame[] = frameKey ? (characterSprite[frameKey] as unknown as BucklerCharFrame[]) : [];
    setLoading(true);
    const preLoadEl = new Image();
    preLoadEl.onload = () => {
      setCurFrame(frames[0]);
      setLoading(false);
    };
    preLoadEl.src = characterSprite?.meta?.image;
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
      <div
        ref={imgEl}
        className="CharacterSprite-img"
        style={{
          width: `${curFrame?.rotated ? curFrame?.frame?.h : curFrame?.frame?.w}px`,
          height: `${curFrame?.rotated ? curFrame?.frame?.w : curFrame?.frame?.h}px`,
          transform: `translateX(${curFrame?.rotated ? `${curFrame?.frame?.w}px` : '0'}) rotate(${curFrame?.rotated ? '-90deg' : '0deg'})`,
          backgroundImage: characterSprite?.meta?.image && !loading ? `url(${characterSprite?.meta?.image})` : 'none',
          backgroundPosition: `-${curFrame?.frame?.x}px -${curFrame?.frame?.y}px`,
        }}
      />
    </div>
  );
}

export default CharacterSprite;
