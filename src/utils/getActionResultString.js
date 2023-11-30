import { STAT_ICON, STAT_ID } from '../config/stats';

export default function getActionResultString({ pockestState, result, reporting }) {
  const dateStr = (new Date(result?.timestamp)).toLocaleString();
  const monster = pockestState?.allMonsters.find((m) => m.monster_id === result?.monsterId);
  if (!monster) return `Error parsing ${result?.logType} log`;
  const logType = result?.logType;
  const actionStr = (() => {
    if (logType === 'cleaning') return 'cleaned';
    if (logType === 'meal') return 'fed';
    if (logType === 'training') return `trained ${STAT_ID[result?.type]}`;
    if (logType === 'exchange') {
      const b = pockestState?.allMonsters.find((m) => m.monster_id === result?.target_monster_id);
      return `vs ${b?.name_en}`;
    }
    if (logType === 'cure') return 'cured 🩹';
    if (logType === 'age') return 'appears';
    if (logType === 'hatching') return 'hatched';
    return '';
  })();
  const tags = (() => {
    if (logType === 'exchange') {
      // const isFever = result?.is_spmatch;
      const expectedMemento = Math.ceil((result?.totalStats || 0) / 2);
      const expectedEgg = Math.ceil((result?.totalStats || 0) / 5);
      const isFever = result?.get_memento_point > expectedMemento
        || result?.get_egg_point > expectedEgg;
      return [
        result?.is_spmatch && '🔥FEVER',
        isFever && '🔥FEVER_CALC',
        !result?.is_spmatch && !isFever && 'NO_FEVER',
      ];
    }
    return [];
  })().filter((g) => g).map((g) => `<${g}>`).join(' ');
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
  return `[${dateStr}]${reporting && tags ? ` ${tags}` : ''} ${monster.name_en} ${actionStr}${resultsStr && !reporting ? ` (${resultsStr})` : ''}`;
}
