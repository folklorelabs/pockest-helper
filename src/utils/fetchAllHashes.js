import LocalStorageCache from './LocalStorageCache';

const cache = new LocalStorageCache('PockestHelperSheetHashes');

export default async function fetchAllHashes() {
  const data = await chrome.runtime.sendMessage({ type: 'GET_HASHES' });
  if (data?.error) {
    const cachedData = cache.get();
    if (!cachedData) throw new Error(`${data.error}`);
    console.error(data?.error);
    return cachedData;
  }
  cache.set(data?.hashes);
  return data?.hashes;
}
