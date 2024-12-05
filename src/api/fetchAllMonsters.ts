import { z } from 'zod';
import LocalStorageCache from '../utils/LocalStorageCache';
import logError from '../utils/logError';

const BUCKLER_ENCYCLO_URL = 'https://www.streetfighter.com/6/buckler/api/minigame/encyclopedia/list';
const SHEET_MONSTERS_URL = 'https://folklorelabs.io/pockest-helper-data/v2/monsters.min.json';

const bucklerCache = new LocalStorageCache('PockestHelperBucklerEncyclopedia');
const sheetCache = new LocalStorageCache('PockestHelperSheetMonsters');

import type Monster from '../types/Monster';
import type SheetMonster from '../types/SheetMonster';
import type BucklerEncycloMonster from '../types/BucklerEncycloMonster';
import encycloBookSchema from '../schemas/encycloBookSchema';
import fetchAllHashes from './fetchAllHashes';

const bucklerResSchema = z.object({ data: z.object({ books: z.array(encycloBookSchema) }), message: z.string().optional() });
type BucklerRes = z.infer<typeof bucklerResSchema>;
async function fetchBucklerEncyclo(): Promise<BucklerRes> {
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

async function fetchSheetMonsters(): Promise<SheetMonster[]> {
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

export default async function fetchAllMonsters():Promise<Monster[]> {
  const [
    bucklerData,
    sheetMonsters,
    hashes,
  ] = await Promise.all([
    fetchBucklerEncyclo(),
    fetchSheetMonsters(),
    fetchAllHashes(),
  ]);

  const hashMonsters = hashes.filter((h) => h.type === 'char');

  // merge all buckler encyclopedia into a flat monsters object
  const bucklerMonsters:Record<number, BucklerEncycloMonster[]> = bucklerData?.data?.books.reduce((allMonsters, book) => {
    const newAllMonsters:Record<number, BucklerEncycloMonster[]> = {
      ...allMonsters,
    };
    const { id: eggId, monster } = book;
    const monsterProps = Object.keys(monster);
    const genePropKeys = monsterProps.filter((k) => k.includes('gene'));
    genePropKeys.forEach((gk) => {
      const geneMonsters = monster[gk];
      geneMonsters.forEach((gm) => {
        newAllMonsters[gm?.monster_id] = [
          ...(newAllMonsters[gm?.monster_id] || []),
          {
            ...gm,
            eggId,
            name_en: gm?.name_en !== '???' ? gm?.name_en : '',
            name: gm?.name !== '???' ? gm?.name : '',
          },
        ];
      });
    });
    return newAllMonsters;
  }, {});
  if (!bucklerMonsters) return sheetMonsters as Monster[];

  // inject buckler encyclopedia monster data into each sheet monster
  const allMonsters = Object.keys(bucklerMonsters).map((monsterIdStr) => {
    const monsterId = parseInt(monsterIdStr || '-1', 10);
    const matchingBucklerMonsters = bucklerMonsters[monsterId];
    const bucklerMonster = {
      ...matchingBucklerMonsters[0],
      // TODO: combine/add any diffs found
    };
    const swMonster = sheetMonsters?.find((m) => m.monster_id === monsterId);
    const hashMonster = hashMonsters?.find((h) => h?.id?.includes(`${monsterId}`));
    return {
      ...bucklerMonster,
      ...swMonster,
      hash: hashMonster?.id || bucklerMonster?.hash,
      name_en: swMonster?.name_en || bucklerMonster?.name_en,
    } as Monster;
  });

  return allMonsters;
}
