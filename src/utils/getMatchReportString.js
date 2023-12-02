export default function getMatchReportString({ pockestState, result }) {
  const dateStr = (new Date(result?.timestamp)).toLocaleString();
  const monster = pockestState?.allMonsters.find((m) => m.monster_id === result?.monsterId);
  if (!monster) return `Error parsing ${result?.logType} log`;
  const b = pockestState?.allMonsters.find((m) => m.monster_id === result?.target_monster_id);
  const tags = (() => {
    const expectedMemento = Math.ceil((result?.totalStats || 0) / 2);
    const expectedEgg = Math.ceil((result?.totalStats || 0) / 5);
    const isFever = result?.get_memento_point > expectedMemento
        || result?.get_egg_point > expectedEgg;
    return [
      result?.is_spmatch && '🔥FEVER',
      isFever && '🔥FEVER_CALC',
      !result?.is_spmatch && !isFever && '❌NO_FEVER',
    ];
  })().filter((g) => g).map((g) => `<${g}>`).join(' ');
  return `[${dateStr}]${tags ? ` ${tags}` : ''} ${monster.name_en} vs ${b?.name_en}`;
}
