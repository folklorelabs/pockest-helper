let eggCache;
export default async function fetchAllEggs() {
  if (eggCache) return eggCache;
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/eggs');
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  const { data } = await response.json();
  return data;
}
