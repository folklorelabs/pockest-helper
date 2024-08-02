import LocalStorageCache from './LocalStorageCache';

const bucklerCache = new LocalStorageCache('PockestHelperBucklerEncyclopedia');
const sheetCache = new LocalStorageCache('PockestHelperSheetMonsters');

export default async function fetchAllMonsters() {
  const [
    bucklerRes,
    sheetRes,
  ] = await Promise.all([
    fetch('https://www.streetfighter.com/6/buckler/api/minigame/encyclopedia/list'),
    fetch('https://folklorelabs.io/pockest-helper-data/monsters.min.json'),
  ]);

  // handle sheet data response
  const sheetMonsters = sheetRes.ok ? await sheetRes.json() : sheetCache.get();
  if (!sheetRes.ok) {
    const err = new Error(`Network error (${sheetRes.status})`);
    if (!sheetMonsters) throw err;
    console.error(err);
  }
  sheetCache.set(sheetMonsters);

  // handle buckler data response
  let bucklerData = bucklerRes.ok ? await bucklerRes.json() : bucklerCache.get();
  if (!bucklerRes.ok) {
    const err = new Error(`Network error (${bucklerRes.status})`);
    if (!bucklerData) throw err;
    console.error(err);
  }
  if (!bucklerData?.data) {
    const err = new Error(`Buckler API: ${bucklerData?.message}`);
    bucklerData = bucklerCache.get();
    if (!bucklerData) throw err;
    console.error(err);
  }
  bucklerCache.set(bucklerData);

  // merge all buckler encyclopedia into a flat monsters object
  const bucklerMonsters = bucklerData?.data?.books.reduce((allMonsters, book) => {
    const newAllMonsters = {
      ...allMonsters,
    };
    const { monster } = book;
    const monsterProps = Object.keys(monster);
    const genePropKeys = monsterProps.filter((k) => k.includes('gene'));
    genePropKeys.forEach((gk) => {
      const geneMonsters = monster[gk];
      geneMonsters.forEach((gm) => {
        newAllMonsters[gm?.monster_id] = [
          ...(newAllMonsters[gm?.monster_id] || []),
          gm,
        ];
      });
    });
    return newAllMonsters;
  }, {});
  if (!bucklerMonsters) return sheetMonsters;

  // inject buckler encyclopedia monster data into each sheet monster
  const allMonsters = Object.keys(bucklerMonsters).map((monsterIdStr) => {
    const monsterId = parseInt(monsterIdStr || '-1', 10);
    const matchingBucklerMonsters = bucklerMonsters[monsterId];
    const bucklerMonster = {
      ...matchingBucklerMonsters[0],
      // TODO: combine/add any diffs found
    };
    const swMonster = sheetMonsters?.find((m) => m.monster_id === monsterId);
    return {
      ...bucklerMonster,
      ...swMonster,
    };
  });

  return allMonsters;
}
