let hashesCache;
export default async function fetchAllHashes() {
  if (hashesCache) return hashesCache;
  const { hashes } = await chrome.runtime.sendMessage({ type: 'GET_HASHES' });
  hashesCache = hashes;
  return hashes;
}
