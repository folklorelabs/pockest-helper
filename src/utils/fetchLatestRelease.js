import LocalStorageCache from './LocalStorageCache';

const cache = new LocalStorageCache('PockestHelperReleases');

export default async function fetchLatestReleases() {
  const data = await chrome.runtime.sendMessage({ type: 'GET_LATEST_RELEASE' });
  if (data?.error) {
    console.error(`${data.error}`);
    return cache.get();
  }
  cache.set(data?.release);
  return data?.release;
}
