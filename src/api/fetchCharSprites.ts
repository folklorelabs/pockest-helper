import BucklerCharFrame from "../types/BucklerCharFrame";
import CharSprite from "../types/CharSprite";
import fetchCharAsset from "./fetchCharAsset";

function getFrameImgSrc(hash:string, frameMeta: BucklerCharFrame): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const { rotated } = frameMeta;
    canvas.width = frameMeta.frame.w;
    canvas.height = frameMeta.frame.h;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.addEventListener('load', () => {
      if (!ctx) return;
      if (rotated) ctx.rotate(-90 * (Math.PI / 180));
      const srcImgMeta = {
        x: frameMeta.frame.x,
        y: frameMeta.frame.y,
        w: rotated ? frameMeta.frame.h : frameMeta.frame.w,
        h: rotated ? frameMeta.frame.w :frameMeta.frame.h,
      };
      const destMeta = {
        x: rotated ? -frameMeta.frame.h :0,
        y: 0,
        w: rotated ? frameMeta.frame.h : frameMeta.frame.w,
        h: rotated ? frameMeta.frame.w :frameMeta.frame.h,
      };
      ctx.drawImage(
        img,
        srcImgMeta.x,
        srcImgMeta.y,
        srcImgMeta.w,
        srcImgMeta.h,
        destMeta.x,
        destMeta.y,
        destMeta.w,
        destMeta.h,
      );
      const output = canvas.toDataURL();
      resolve(output);
    });
    img.src = `https://www.streetfighter.com/6/buckler/assets/minigame/img/char/${hash}.png`;
  });
}

async function fetchCharSprites(hash:string):Promise<CharSprite[]> {
    if (!hash) {
      throw new Error(`Invalid hash ${hash}`);
    }
    const charAsset = await fetchCharAsset(hash);
    const { frames } = charAsset;
    const frameKeys = Object.keys(frames);
    const frameReses = frameKeys.map(async (key) => getFrameImgSrc(hash, frames[key]));
    const imgSrcs = await Promise.all(frameReses);
    return imgSrcs.map((data, i) => ({
      fileName: frameKeys[i],
      data,
      w: frames[frameKeys[i]]?.frame?.w,
      h: frames[frameKeys[i]]?.frame?.h,
    }));
}

export default fetchCharSprites;
