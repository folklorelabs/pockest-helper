export default function isMatchDiscovery(pockestState, result) {
  const monsterId = (pockestState?.data?.monster?.hash?.split('-') || '')[0];
  const monster = pockestState?.allMonsters.find((m) => m.monster_id === monsterId);
  if (!result?.get_memento_point && !result?.get_egg_point) return false;
  const allMissing = [
    ...(monster?.matchSusFever || []),
    ...(monster?.matchUnknown || []),
    ...(monster?.matchSusNormal || []),
  ];
  return allMissing.includes(result?.target_monster_id);
}
