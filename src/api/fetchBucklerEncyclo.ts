import { z } from 'zod';
import LocalStorageCache from '../utils/LocalStorageCache';
import logError from '../utils/logError';

const BUCKLER_ENCYCLO_URL = 'https://www.streetfighter.com/6/buckler/api/minigame/encyclopedia/list';

const bucklerCache = new LocalStorageCache('PockestHelperBucklerEncyclopedia');

import encycloBookSchema from '../schemas/encycloBookSchema';

const bucklerResSchema = z.object({ data: z.object({ books: z.array(encycloBookSchema) }), message: z.string().optional() });
type BucklerRes = z.infer<typeof bucklerResSchema>;

export default async function fetchBucklerEncyclo(): Promise<BucklerRes> {
  const url = BUCKLER_ENCYCLO_URL;
  const bucklerRes = await fetch(url);
  let bucklerData:BucklerRes = bucklerRes.ok ? await bucklerRes.json() : await bucklerCache.get();
  if (!bucklerRes.ok) {
    const err = new Error(`API ${bucklerRes.status} response (${BUCKLER_ENCYCLO_URL})`);
    if (!bucklerData) throw err;
    logError(err);
  }
  if (!bucklerData?.data) {
    const err = new Error(`Buckler Response: ${bucklerData?.message}`);
    bucklerData = await bucklerCache.get();
    if (!bucklerData) throw err;
    logError(err);
  }
  const bucklerDataParsed = bucklerResSchema.safeParse(bucklerData);
  if (bucklerDataParsed.error) throw new Error(`${bucklerDataParsed.error.issues.map((iss) => `[${iss.code}] ${iss.message ? iss.message : ''} (${iss.path})`)}`);
  await bucklerCache.set(bucklerData);
  return bucklerDataParsed?.data;
}