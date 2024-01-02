let cache;
export default async function fetchLatestRelease() {
  if (cache) return cache;
  const response = await fetch('https://api.github.com/repos/folklorelabs/pockest-helper/releases');
  const res = await response.json();
  if (!Array.isArray(res)) throw new Error(`[fetchLatestRelease] Unexpected response type ${typeof res}`);
  const latestRelease = res.find((r) => !r.prerelease);
  return latestRelease;
}
