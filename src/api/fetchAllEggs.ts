import { z } from 'zod';
import logError from '../utils/logError';
import LocalStorageCache from '../utils/LocalStorageCache';
import eggListSchema from '../schemas/eggListSchema';

const cache = new LocalStorageCache('PockestHelperBucklerEggs');

export default async function fetchAllEggs(): Promise<z.infer<typeof eggListSchema>> {
  try {
    const bucklerUrl = 'https://www.streetfighter.com/6/buckler/api/minigame/eggs';
    const response = await fetch(bucklerUrl);
    if (!response.ok) throw new Error(`API ${response.status} response`);
    const data = await response.json();
    const dataParsed = eggListSchema.safeParse(data);
    if (dataParsed.error) throw dataParsed.error;
    const eggData = dataParsed?.data;
    cache.set(eggData);
    return eggData;
  } catch (err) {
    logError(`${err}`);
    return cache.get();
  }
}
