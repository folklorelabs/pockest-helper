import fetchJsonArray from './fetchJsonArray';

const MONSTER_CACHE_DURATION = 1000 * 60 * 60;

let monsterCache;
let lastMonsterCache;
export default async function fetchAllMonsters() {
  const now = (new Date()).getTime();
  if (monsterCache && (now - lastMonsterCache) < MONSTER_CACHE_DURATION) return monsterCache;
  const [
    bucklerRes,
    selfHostedMonsters,
  ] = await Promise.all([
    fetch('https://www.streetfighter.com/6/buckler/api/minigame/encyclopedia/list'),
    fetchJsonArray('https://folklorelabs.io/pockest-helper-data/monsters.min.json'),
  ]);
  if (!bucklerRes.ok) throw new Error(`Network error (${bucklerRes.status})`);
  const { data } = await bucklerRes.json();
  const buckerMonsters = data?.books.reduce((allMonsters, book) => {
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
  if (!buckerMonsters) return selfHostedMonsters;
  const allMonsters = Object.keys(buckerMonsters).map((monsterIdStr) => {
    const monsterId = parseInt(monsterIdStr || '-1', 10);
    const matchingBucklerMonsters = buckerMonsters[monsterId];
    const bucklerMonster = {
      ...matchingBucklerMonsters[0],
      // TODO: combine/add any diffs found
    };
    const swMonster = selfHostedMonsters?.find((m) => m.monster_id === monsterId);
    return {
      ...bucklerMonster,
      ...swMonster,
    };
  });
  monsterCache = allMonsters;
  lastMonsterCache = (new Date()).getTime();
  return allMonsters;
}
