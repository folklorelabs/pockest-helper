let cache;
export default async function fetchAllHashes() {
  if (cache) return cache;
  const { release } = await chrome.runtime.sendMessage({ type: 'GET_LATEST_RELEASE' });
  cache = release;
  return release;
}
