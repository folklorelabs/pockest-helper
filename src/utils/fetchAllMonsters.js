let monsterCache;
export default async function fetchAllMonsters() {
  if (monsterCache) return monsterCache;
  const [
    bucklerRes,
    serviceWorkerRes,
  ] = await Promise.all([
    fetch('https://www.streetfighter.com/6/buckler/api/minigame/encyclopedia/list'),
    chrome.runtime.sendMessage({ type: 'GET_MONSTERS' }),
  ]);
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
  if (!buckerMonsters) return serviceWorkerRes?.monsters;
  const allMonsters = Object.keys(buckerMonsters).map((monsterIdStr) => {
    const monsterId = parseInt(monsterIdStr || '-1', 10);
    const matchingBucklerMonsters = buckerMonsters[monsterId];
    const bucklerMonster = {
      ...matchingBucklerMonsters[0],
      // TODO: combine/add any diffs found
    };
    const swMonster = serviceWorkerRes?.monsters?.find((m) => m.monster_id === monsterId);
    return {
      ...bucklerMonster,
      ...swMonster,
    };
  });
  monsterCache = allMonsters;
  return allMonsters;
}
