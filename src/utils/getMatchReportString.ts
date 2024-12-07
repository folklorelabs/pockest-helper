import LogEntry from "../contexts/PockestContext/types/LogEntry";
import PockestState from "../contexts/PockestContext/types/PockestState";

export default function getMatchReportString({ pockestState, result }: { pockestState: PockestState; result: LogEntry; }) {
  if (result?.logType !== 'exchange') return `Error parsing match report (received logType: ${result?.logType})`;
  const monster = pockestState?.allMonsters.find((m) => m.monster_id === result?.monsterId);
  if (!monster) return `Error parsing ${result?.logType} log`;
  const b = pockestState?.allMonsters.find((m) => m.monster_id === result?.target_monster_id);
  const tags = (() => [
    result?.is_spmatch && '🔥FEVER',
    !result?.is_spmatch && '❌NO_FEVER',
  ])().filter((g) => g).map((g) => `<${g}>`).join(' ');
  return `${tags ? ` ${tags}` : ''} ${monster.name_en} vs ${b?.name_en}`;
}
