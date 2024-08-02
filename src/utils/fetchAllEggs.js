import LocalStorageCache from './LocalStorageCache';

const cache = new LocalStorageCache('PockestHelperBucklerEggs');

export default async function fetchAllEggs() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/eggs');
  if (!response.ok) {
    const cachedData = cache.get();
    const err = new Error(`Network error (${response.status})`);
    if (!cachedData) throw err;
    console.error(err);
    return cachedData;
  }
  const { data } = await response.json();
  cache.set(data);
  return data;
}
