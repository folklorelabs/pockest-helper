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
  const monsters = serviceWorkerRes?.monsters?.map((ssm) => {
    const matches = data?.books.reduce((all, book) => {
      const { monster } = book;
      const monsterProps = Object.keys(monster);
      const genePropKeys = monsterProps.filter((k) => k.includes('gene'));
      const geneMatches = genePropKeys.reduce((monsterMatches, k) => {
        const match = monster[k].find((mk) => mk.monster_id === ssm.monster_id);
        if (!match) return monsterMatches;
        return [
          ...monsterMatches,
          {
            ...match,
            ...ssm,
          },
        ];
      }, []);
      if (!geneMatches.length) return all;
      return [
        ...all,
        ...geneMatches,
      ];
    }, []);
    // TODO: combine any necessary attributes across the multiple versions like ".from"
    return matches?.[0];
  });
  monsterCache = monsters;
  return monsters;
}
