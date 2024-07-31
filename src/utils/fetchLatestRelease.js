import fetchJsonArray from './fetchJsonArray';

let cache;
export default async function fetchLatestReleases() {
  if (cache) return cache;
  try {
    const releases = await fetchJsonArray('https://api.github.com/repos/folklorelabs/pockest-helper/releases');
    cache = releases;
    return releases?.filter((r) => !r.prerelease)[0];
  } catch (err) {
    console.error(`${err}`);
    return null;
  }
}
