import fetchJsonArray from './fetchJsonArray';
import LocalStorageCache from './LocalStorageCache';

const cache = new LocalStorageCache('PockestHelperReleases');

export default async function fetchLatestReleases() {
  try {
    const releases = await fetchJsonArray('https://api.github.com/repos/folklorelabs/pockest-helper/releases');
    const latestRelease = releases?.filter((r) => !r.prerelease)[0];
    cache.set(latestRelease);
    return latestRelease;
  } catch (err) {
    console.error(`${err}`);
    return cache.get();
  }
}
