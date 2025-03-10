import CharAsset from "../types/BucklerCharAsset";

const cache:Record<string, CharAsset> = {};
export default async function fetchCharAssets(hash: string): Promise<CharAsset|null> {
  if (!hash) return null;
  if (cache[hash]) return cache[hash];
  const url = `https://www.streetfighter.com/6/buckler/assets/minigame/img/char/${hash}.json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
  const { frames, meta } = await response.json();
  const newData:CharAsset = {
    image: `https://www.streetfighter.com/6/buckler/assets/minigame/img/char/${meta?.image}`,
    size: meta?.size,
    attack: [
      frames?.[`${hash}_idle_1.png`],
      frames?.[`${hash}_attack.png`],
    ],
    down: [
      frames?.[`${hash}_down.png`],
    ],
    idle: [
      frames?.[`${hash}_idle_1.png`],
      frames?.[`${hash}_idle_2.png`],
    ],
    win: [
      frames?.[`${hash}_win_1.png`],
      frames?.[`${hash}_win_2.png`],
    ],
  };
  cache[hash] = newData;
  return newData;
}

