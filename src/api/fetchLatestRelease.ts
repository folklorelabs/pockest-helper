import { z } from 'zod';
import githubReleaseSchema from '../schemas/githubReleaseSchema';
import LocalStorageCache from '../utils/LocalStorageCache';
import logError from '../utils/logError';

const cache = new LocalStorageCache('PockestHelperReleases');

const resSchema = z.array(githubReleaseSchema);

export default async function fetchLatestReleases() {
  try {
    const curVersion = import.meta.env.VITE_APP_VERSION;
    const response = await fetch('https://api.github.com/repos/folklorelabs/pockest-helper/releases');
    if (!response.ok) throw new Error(`API ${response.status} response`);
    const data = await response.json();
    const dataParsed = resSchema.safeParse(data);
    if (dataParsed.error) throw dataParsed.error;
    const releases = dataParsed?.data;
    if (!releases) throw new Error(`No data to fetch`);
    const latestRelease = releases?.filter((r) => curVersion.includes('rc') || !r.prerelease)[0];
    cache.set(latestRelease);
    return latestRelease;
  } catch (err) {
    logError(`${err}`);
    return cache.get();
  }
}
