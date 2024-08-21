import fetchJsonArray from './fetchJsonArray';
import LocalStorageCache from './LocalStorageCache';
import logError from './logError';

const cache = new LocalStorageCache('PockestHelperSheetHashes');

export default async function fetchAllHashes() {
  try {
    const hashes = await fetchJsonArray('https://folklorelabs.io/pockest-helper-data/v2/hashes.min.json');
    const newHashes = hashes.filter((h) => h.id);
    cache.set(newHashes);
    return newHashes;
  } catch (err) {
    const cachedData = cache.get();
    if (!cachedData) throw new Error(`${err}`);
    logError(err);
    return cachedData;
  }
}
