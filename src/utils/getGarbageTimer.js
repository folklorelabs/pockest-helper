import getStomachTimer from './getStomachTimer';

export const GARBAGE_TIME = (2 * 60 * 60 * 1000);
export const GARBAGE_MAX = 12;

export default function getGarbageTimer(pockestState) {
  if (typeof pockestState?.data?.monster?.stomach !== 'number') return null;
  if (pockestState?.data?.monster?.stomach >= GARBAGE_MAX) return null;
  const stomachTimer = getStomachTimer(pockestState);
  const nextSmall = pockestState?.data?.next_small_event_timer;
  if (stomachTimer && stomachTimer !== nextSmall) return nextSmall;
  const now = (new Date()).getTime();
  const lastClean = Math.max(pockestState?.data?.monster?.live_time, pockestState?.log
    .reduce((latestTs, entry) => {
      // filter out non-clean log entries
      if (entry.logType !== 'cleaning') return latestTs;

      // filter out old monster log entries
      const potentialLatestTs = entry?.timestamp;
      if (potentialLatestTs < pockestState?.data?.monster?.liveTime) return latestTs;

      // return potentialLatestTs if later, otherwise keep old
      return (potentialLatestTs > latestTs) ? potentialLatestTs : latestTs;
    }, null));
  const garbageDiff = Math.ceil((now - lastClean) / GARBAGE_TIME);
  console.log((new Date(lastClean)).toLocaleString(), garbageDiff);
  return lastClean + (garbageDiff * GARBAGE_TIME);
}
