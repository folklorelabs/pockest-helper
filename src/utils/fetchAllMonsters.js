import MONSTERS from '../data/monsters';

let monsterCache;
export default async function fetchAllMonsters() {
  if (monsterCache) return monsterCache;
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/encyclopedia/list');
  const { data } = await response.json();
  const monsters = MONSTERS.map((M) => {
    const matches = data?.books.reduce((all, book) => {
      const { monster } = book;
      const monsterProps = Object.keys(monster);
      const genePropKeys = monsterProps.filter((k) => k.includes('gene'));
      const geneMatches = genePropKeys.reduce((monsterMatches, k) => {
        const match = monster[k].find((mk) => mk.monster_id === M.monster_id);
        if (!match) return monsterMatches;
        return [
          ...monsterMatches,
          {
            ...match,
            ...M,
          },
        ];
      }, []);
      if (!geneMatches.length) return all;
      return [
        ...all,
        ...geneMatches,
      ];
    }, []);
    return matches?.[0];
  });
  monsterCache = monsters;
  return monsters;
}
