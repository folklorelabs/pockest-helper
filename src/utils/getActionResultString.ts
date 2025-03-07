import { STAT_ICON, STAT_ID } from '../constants/stats';
import LogEntry from '../contexts/PockestContext/types/LogEntry';
import PockestState from '../contexts/PockestContext/types/PockestState';
import { parseDurationStr } from './parseDuration';
import prettyTimeStamp from './prettyTimestamp';

export default function getActionResultString({ pockestState, result, isRelTime = false }: { pockestState: PockestState, result: LogEntry, isRelTime?: boolean }) {
  const dateStr = (() => {
    if (!result?.timestamp) return 'UNAVAIL';
    if (!isRelTime) return prettyTimeStamp(result?.timestamp);
    if (!pockestState?.data?.monster?.live_time) return parseDurationStr(0);
    const logIndex = pockestState?.log?.findIndex((l) => result?.timestamp
      && l.timestamp === result.timestamp);
    const monsterBirth = result?.monsterBirth || pockestState?.log?.reduce<number | null>((acc, l, index) => {
      if (pockestState?.data?.monster?.live_time && l.timestamp >= pockestState?.data?.monster?.live_time) return pockestState.data.monster.live_time;
      if (index > logIndex) return acc;
      if (l.logType === 'death' || l.logType === 'departure') return null;
      if (l.logType === 'hatching') return l.timestamp;
      return acc;
    }, null);
    if (!monsterBirth) return parseDurationStr(0);
    return result.timestamp >= monsterBirth
      ? parseDurationStr(result.timestamp - monsterBirth)
      : `-${parseDurationStr(monsterBirth - result.timestamp)}`;
  })();
  const monster = pockestState?.allMonsters.find((m) => m.monster_id === result?.monsterId);
  const monsterName = monster?.name_en || `MONSTER_${result?.monsterId}`;
  const logType = result?.logType;
  const actionStr = (() => {
    if (logType === 'cleaning') return 'cleaned';
    if (logType === 'meal') return 'fed';
    if (logType === 'training') return `trained ${STAT_ID[result?.type]}`;
    if (logType === 'trainingSkip') return `skipped training`;
    if (logType === 'exchange') {
      const b = pockestState?.allMonsters.find((m) => m.monster_id === result?.target_monster_id);
      return `vs ${result?.target_monster_name_en || b?.name_en}`;
    }
    if (logType === 'cure') return 'cured 🩹';
    if (logType === 'evolution') return 'appears';
    if (logType === 'hatching') return 'hatched';
    if (logType === 'error') return `ERROR❗${result?.error}`;
    if (logType === 'death') return 'died 🪦';
    if (logType === 'evolution_failure') return 'failed to evolve 🫠';
    if (logType === 'departure') return 'departed 🛫';
    return '';
  })();
  const resultsStr = (() => {
    if (logType === 'evolution') {
      return [`P: ${result?.power}`, `S: ${result?.speed}`, `T: ${result?.technic}`];
    }
    if (logType === 'cleaning') return [`💩${result?.garbageBefore || 0} → 0`];
    if (logType === 'meal') return [`❤️${(result?.stomach || 0) - 1} → ${result?.stomach || 0}`];
    if (logType === 'training') return [`+${result?.up_status}${STAT_ICON[result?.type]}`];
    if (logType === 'evolution_failure') return [`${result?.planId}`, `P: ${result?.power}`, `S: ${result?.speed}`, `T: ${result?.technic}`, `MEMS: ${result?.mementosOwned?.map((mId) => pockestState?.allMonsters.find((m) => m.monster_id === mId)?.name_en).join(', ')}`];
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
