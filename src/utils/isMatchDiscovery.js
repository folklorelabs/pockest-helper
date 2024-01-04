export default function isMatchDiscovery(pockestState, result) {
  const monster = pockestState?.allMonsters.find((m) => m.monster_id === result?.monsterId);
  const allMissing = [
    ...(monster?.matchSusFever || []),
    ...(monster?.matchUnknown || []),
    ...(monster?.matchSusNormal || []),
  ];
  return allMissing.includes(result?.target_monster_id);
}
