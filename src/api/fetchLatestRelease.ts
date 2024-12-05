import fetchJsonArray from '../utils/fetchJsonArray';
import LocalStorageCache from '../utils/LocalStorageCache';
import logError from '../utils/logError';

const cache = new LocalStorageCache('PockestHelperReleases');

export default async function fetchLatestReleases() {
  try {
    const curVersion = import.meta.env.VITE_APP_VERSION;
    const releases = await fetchJsonArray('https://api.github.com/repos/folklorelabs/pockest-helper/releases');
    const latestRelease = releases?.filter((r) => curVersion.includes('rc') || !r.prerelease)[0];
    cache.set(latestRelease);
    return latestRelease;
  } catch (err) {
    logError(`${err}`);
    return cache.get();
  }
}
