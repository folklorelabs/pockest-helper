export default function isMatchDiscovery(pockestState, result) {
  const monsterIdStr = (pockestState?.data?.monster?.hash?.split('-') || '')[0];
  const monsterId = monsterIdStr ? parseInt(monsterIdStr, 10) : null;
  const monster = pockestState?.allMonsters.find((m) => m.monster_id === monsterId);
  const allMissing = [
    ...(monster?.matchSusFever || []),
    ...(monster?.matchUnknown || []),
    ...(monster?.matchSusNormal || []),
  ];
  return allMissing.includes(result?.target_monster_id);
}
