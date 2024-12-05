import LocalStorageCache from '../utils/LocalStorageCache';
import logError from '../utils/logError';

const SHEET_MONSTERS_URL = 'https://folklorelabs.io/pockest-helper-data/v2/monsters.min.json';

const sheetCache = new LocalStorageCache('PockestHelperSheetMonsters');

import type SheetMonster from '../types/SheetMonster';

export default async function fetchSheetMonsters(): Promise<SheetMonster[]> {
  const url = SHEET_MONSTERS_URL;
  const sheetRes = await fetch(url);
  const sheetMonsters:SheetMonster[] = sheetRes.ok ? await sheetRes.json() : await sheetCache.get();
  if (!sheetRes.ok) {
    const err = new Error(`API ${sheetRes.status} response (${SHEET_MONSTERS_URL})`);
    if (!sheetMonsters) throw err;
    logError(err);
  }
  await sheetCache.set(sheetMonsters);
  return sheetMonsters;
}