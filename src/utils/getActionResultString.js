import { STAT_ICON, STAT_ID } from '../config/stats';

export default function getActionResultString({ pockestState, result }) {
  const dateStr = (new Date(result?.timestamp)).toLocaleString();
  const monster = pockestState?.allMonsters.find((m) => m.monster_id === result?.monsterId);
  const monsterName = monster?.name_en || `MONSTER_${result?.monsterId}`;
  const logType = result?.logType;
  const actionStr = (() => {
    if (logType === 'cleaning') return 'cleaned';
    if (logType === 'meal') return 'fed';
    if (logType === 'training') return `trained ${STAT_ID[result?.type]}`;
    if (logType === 'exchange') {
      const b = pockestState?.allMonsters.find((m) => m.monster_id === result?.target_monster_id);
      return `vs ${result?.target_monster_name_en || b?.name_en}`;
    }
    if (logType === 'cure') return 'cured 🩹';
    if (logType === 'age') return 'appears';
    if (logType === 'hatching') return 'hatched';
    if (logType === 'error') return `ERROR❗${result?.error}`;
    if (logType === 'death') return 'died 🪦';
    if (logType === 'departure') return 'departed 🛫';
    return '';
  })();
  const resultsStr = (() => {
    if (logType === 'age') return [`⬆️ ${result?.monsterBefore?.name_en}`, `P: ${result?.monsterBefore?.power}`, `S: ${result?.monsterBefore?.speed}`, `T: ${result?.monsterBefore?.technic}`];
    if (logType === 'cleaning') return [`💩${result?.garbageBefore || 0} → 0`];
    if (logType === 'meal') return [`❤️${(result?.stomach || 0) - 1} → ${result?.stomach || 0}`];
    if (logType === 'training') return [`+${result?.up_status}${STAT_ICON[result?.type]}`];
    if (logType === 'exchange') {
      return [
        result?.is_spmatch && '🔥fever',
        result?.get_memento_point && `+${result?.get_memento_point} memento`,
        result?.get_egg_point && `+${result?.get_egg_point} egg`,
        // result?.memento_get && 'GOT_MEMENTO',
      ];
    }
    if (logType === 'hatching') return [`🥚#${result?.eggType}`];
    return [];
  })().filter((g) => g).join(', ');
  return `[${dateStr}] ${monsterName} ${actionStr}${resultsStr ? ` (${resultsStr})` : ''}`;
}
