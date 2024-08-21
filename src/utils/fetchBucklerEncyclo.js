import LocalStorageCache from './LocalStorageCache';
import logError from './logError';

const BUCKLER_ENCYCLO_URL = 'https://www.streetfighter.com/6/buckler/api/minigame/encyclopedia/list';

const bucklerCache = new LocalStorageCache('PockestHelperBucklerEncyclopedia');

export default async function fetchBucklerEncyclo() {
  const bucklerRes = await fetch(BUCKLER_ENCYCLO_URL);
  let bucklerData = bucklerRes.ok ? await bucklerRes.json() : bucklerCache.get();
  if (!bucklerRes.ok) {
    const err = new Error(`API ${bucklerRes.status} response (${BUCKLER_ENCYCLO_URL})`);
    if (!bucklerData) throw err;
    logError(err);
  }
  if (!bucklerData?.data) {
    const err = new Error(`Buckler Response: ${bucklerData?.message}`);
    bucklerData = bucklerCache.get();
    if (!bucklerData) throw err;
    logError(err);
  }
  bucklerCache.set(bucklerData);
  return bucklerData;
}
