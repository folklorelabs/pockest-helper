import LocalStorageCache from './LocalStorageCache';

const cache = new LocalStorageCache('PockestHelperBucklerEggs');

export default async function fetchAllEggs() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/eggs');
  let bucklerData = response.ok ? await response.json() : cache.get();
  if (!response.ok) {
    const cachedData = cache.get();
    const err = new Error(`Network error (${response.status})`);
    if (!cachedData) throw err;
    console.error(err);
    return cachedData;
  }
  if (!bucklerData?.data) {
    const err = new Error(`Buckler API: ${bucklerData?.message}`);
    bucklerData = cache.get();
    if (!bucklerData) throw err;
    console.error(err);
  }
  cache.set(bucklerData?.data);
  return bucklerData?.data;
}
