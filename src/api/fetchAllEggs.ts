import logError from '../utils/logError';
import LocalStorageCache from '../utils/LocalStorageCache';
import BucklerEggsData from '../types/BucklerEggsData';

const cache = new LocalStorageCache('PockestHelperBucklerEggs');

export default async function fetchAllEggs():Promise<BucklerEggsData> {
  const bucklerUrl = 'https://www.streetfighter.com/6/buckler/api/minigame/eggs';
  const response = await fetch(bucklerUrl);
  let bucklerData = response.ok ? await response.json() : await cache.get();
  if (!response.ok) {
    const cachedData = await cache.get();
    const err = new Error(`API ${response.status} response (${bucklerUrl})`);
    if (!cachedData) throw err;
    logError(err);
    return cachedData;
  }
  if (!bucklerData?.data) {
    const err = new Error(`Buckler Response: ${bucklerData?.message}`);
    bucklerData = await cache.get();
    if (!bucklerData) throw err;
    logError(err);
  }
  await cache.set(bucklerData?.data);
  return bucklerData?.data;
}
