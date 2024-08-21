import fetchAllHashes from './fetchAllHashes';
import fetchBucklerEncyclo from './fetchBucklerEncyclo';
import fetchSheetMonsters from './fetchSheetMonsters';

export default async function fetchAllMonsters() {
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
  const bucklerMonsters = bucklerData?.data?.books.reduce((allMonsters, book) => {
    const newAllMonsters = {
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
            eggIds: [
              eggId,
            ],
          },
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
    const bucklerMonster = matchingBucklerMonsters.reduce((combinedMonster, m) => ({
      ...combinedMonster,
      ...m,
      eggIds: [
        ...(combinedMonster?.eggIds || []),
        ...m.eggIds,
      ],
    }), {});
    const sheetMonster = sheetMonsters?.find((m) => m.monster_id === monsterId);
    const hashMonster = hashMonsters?.find((h) => h.id.includes(monsterId));
    return {
      ...bucklerMonster,
      ...sheetMonster,
      hash: hashMonster?.id || sheetMonster.hash || bucklerMonster.hash,
      name_en: hashMonster?.name_en || sheetMonster.name_en || bucklerMonster.name_en,
    };
  });

  return allMonsters;
}
