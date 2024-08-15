function getCharImgSrc(hash, frameId = 'win_1') {
  return new Promise((resolve, reject) => {
    if (!hash) {
      reject(new Error(`Invalid hash ${hash}`));
      return;
    }
    (async () => {
      const url = `https://www.streetfighter.com/6/buckler/assets/minigame/img/char/${hash}.json`;
      const res = await fetch(url);
      if (!res.ok) {
        reject(new Error(`Network error ${res.status} (${url})`));
        return;
      }
      const { frames } = await res.json();
      const frameMeta = frames?.[`${hash}_${frameId}.png`];
      const canvas = document.createElement('canvas');
      canvas.width = frameMeta.frame.w;
      canvas.height = frameMeta.frame.h;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.addEventListener('load', () => {
        if (frameMeta.rotated) {
          ctx.rotate(-90 * (Math.PI / 180));
        }
        const size = Math.max(frameMeta.frame.w, frameMeta.frame.h);
        const srcImgMeta = {
          x: frameMeta.frame.x,
          y: frameMeta.frame.y,
          w: size,
          h: size,
        };
        const destMeta = {
          x: frameMeta.rotated ? -srcImgMeta.h : 0,
          y: 0,
          w: size,
          h: size,
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
    })();
  });
}

export default getCharImgSrc;
