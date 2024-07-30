let hashesCache;
export default async function fetchAllHashes() {
  if (hashesCache) return hashesCache;
  const data = await chrome.runtime.sendMessage({ type: 'GET_HASHES' });
  if (data?.error) {
    throw new Error(`${data.error}`);
  }
  hashesCache = data?.hashes;
  return data?.hashes;
}
