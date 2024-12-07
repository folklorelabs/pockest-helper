import { z } from 'zod';
import sheetHashSchema from '../schemas/sheetHashSchema';
import SheetHash from '../types/SheetHash';
import LocalStorageCache from '../utils/LocalStorageCache';
import logError from '../utils/logError';

const cache = new LocalStorageCache('PockestHelperSheetHashes');

const resSchema = z.array(sheetHashSchema);

export default async function fetchAllHashes():Promise<SheetHash[]> {
  const url = 'https://folklorelabs.io/pockest-helper-data/v2/hashes.min.json';
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API ${response.status} response`);
    const data = await response.json();
    const filteredData = data.filter((h:SheetHash) => h.id);
    const dataParsed = resSchema.safeParse(filteredData);
    if (dataParsed.error) throw dataParsed.error;
    const hashes = dataParsed?.data;
    if (!hashes) throw new Error(`No data to fetch`);
    await cache.set(hashes);
    return hashes;
  } catch (err) {
    logError(err, url);
    const cachedData = await cache.get();
    if (!cachedData) throw new Error(`${err}`);
    return cachedData;
  }
}
