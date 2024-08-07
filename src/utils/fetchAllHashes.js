import fetchJsonArray from './fetchJsonArray';
import LocalStorageCache from './LocalStorageCache';
import logError from './logError';

const cache = new LocalStorageCache('PockestHelperSheetHashes');

export default async function fetchAllHashes() {
  try {
    const hashes = await fetchJsonArray('https://folklorelabs.io/pockest-helper-data/hashes.min.json');
    cache.set(hashes);
    return hashes;
  } catch (err) {
    const cachedData = cache.get();
    if (!cachedData) throw new Error(`${err}`);
    logError(err);
    return cachedData;
  }
}
