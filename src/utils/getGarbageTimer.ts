import PockestState from '../contexts/PockestContext/types/PockestState';
import getStomachTimer from './getStomachTimer';

export const GARBAGE_TIME = (2 * 60 * 60 * 1000);
export const GARBAGE_MAX = 12;

export default function getGarbageTimer(pockestState: PockestState) {
  if (typeof pockestState?.data?.monster?.stomach !== 'number') return null;
  if (typeof pockestState?.data?.monster?.garbage !== 'number') return null;
  if (pockestState.data.monster.garbage >= GARBAGE_MAX) return null;
  const stomachTimer = getStomachTimer(pockestState);
  const nextSmall = pockestState?.data?.next_small_event_timer;
  if (stomachTimer && stomachTimer !== nextSmall) return nextSmall;
  const now = (new Date()).getTime();
  const lastClean = Math.max(
    pockestState?.data?.monster?.live_time || 0,
    pockestState?.data?.monster?.live_time && pockestState?.cleanTimestamp && pockestState.data.monster.live_time < pockestState?.cleanTimestamp ? pockestState?.cleanTimestamp : 0,
    pockestState?.log.reduce<number>((latestTs, entry) => {
      // filter out non-clean log entries
      if (entry.logType !== 'cleaning') return latestTs;

      // filter out old monster log entries
      const potentialLatestTs = entry?.timestamp;
      if (pockestState?.data?.monster?.live_time && potentialLatestTs < pockestState?.data?.monster?.live_time) return latestTs;

      // return potentialLatestTs if later, otherwise keep old
      return (potentialLatestTs > latestTs) ? potentialLatestTs : latestTs;
    }, 0),
  );
  const garbageDiff = Math.ceil((now - lastClean) / GARBAGE_TIME);
  const nextGarbage = pockestState.data.monster.garbage + 1;
  if (nextGarbage > garbageDiff) return null; // clean prolly missing from log
  return lastClean + (garbageDiff * GARBAGE_TIME);
}
