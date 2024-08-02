const cache = {};
export default async function fetchCharAssets(hash) {
  if (!hash) return null;
  if (cache[hash]) return cache[hash];
  const response = await fetch(`https://www.streetfighter.com/6/buckler/assets/minigame/img/char/${hash}.json`);
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  const { frames, meta } = await response.json();
  const newData = {
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
