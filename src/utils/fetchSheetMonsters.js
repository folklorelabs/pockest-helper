import LocalStorageCache from './LocalStorageCache';
import logError from './logError';

const SHEET_MONSTERS_URL = 'https://folklorelabs.io/pockest-helper-data/v2/monsters.min.json';

const sheetCache = new LocalStorageCache('PockestHelperSheetMonsters');

export default async function fetchSheetMonsters() {
  const sheetRes = await fetch(SHEET_MONSTERS_URL);
  const sheetMonsters = sheetRes.ok ? await sheetRes.json() : sheetCache.get();
  if (!sheetRes.ok) {
    const err = new Error(`API ${sheetRes.status} response (${SHEET_MONSTERS_URL})`);
    if (!sheetMonsters) throw err;
    logError(err);
  }
  sheetCache.set(sheetMonsters);
  return sheetMonsters;
}
