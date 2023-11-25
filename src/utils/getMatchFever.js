import monsters from '../data/monsters.json';

export async function fetchMatchList() {
  const response = await fetch('https://www.streetfighter.com/6/buckler/api/minigame/exchange/list');
  const { data } = await response.json();
  return data;
}

export default async function getMatchFever(monsterId) {
  const monster = monsters.find((m) => m.monster_id === monsterId);
  const matchFeverOptions = monster?.matchFever;
  if (!matchFeverOptions || !matchFeverOptions.length) return null;
  const { exchangeList } = await fetchMatchList();
  const match = exchangeList.find((opp) => matchFeverOptions.includes(opp.monster_id));
  return match?.slot;
}
