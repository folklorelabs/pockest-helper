import logError from './logError';
import LocalStorageCache from './LocalStorageCache';

const cache = new LocalStorageCache('PockestHelperBucklerEggs');

export default async function fetchAllEggs() {
  const bucklerUrl = 'https://www.streetfighter.com/6/buckler/api/minigame/eggs';
  const response = await fetch(bucklerUrl);
  let bucklerData = response.ok ? await response.json() : cache.get();
  if (!response.ok) {
    const cachedData = cache.get();
    const err = new Error(`API ${response.status} response (${bucklerUrl})`);
    if (!cachedData) throw err;
    logError(err);
    return cachedData;
  }
  if (!bucklerData?.data) {
    const err = new Error(`Buckler Response: ${bucklerData?.message}`);
    bucklerData = cache.get();
    if (!bucklerData) throw err;
    logError(err);
  }
  cache.set(bucklerData?.data);
  return bucklerData?.data;
}
