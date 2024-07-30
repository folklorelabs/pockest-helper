let cache;
export default async function fetchLatestReleases() {
  if (cache) return cache;
  const data = await chrome.runtime.sendMessage({ type: 'GET_LATEST_RELEASE' });
  if (data?.error) {
    console.error(`${data.error}`);
    return null;
  }
  cache = data?.release;
  return data?.release;
}
