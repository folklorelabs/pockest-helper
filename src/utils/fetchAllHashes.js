import browser from 'webextension-polyfill';

let hashesCache;
export default async function fetchAllHashes() {
  if (hashesCache) return hashesCache;
  const data = await browser.runtime.sendMessage({ type: 'GET_HASHES' });
  if (data?.error) {
    throw new Error(`${data.error}`);
  }
  hashesCache = data?.hashes;
  return data?.hashes;
}
