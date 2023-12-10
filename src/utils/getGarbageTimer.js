import getStomachTimer from './getStomachTimer';

export const GARBAGE_TIME = (2 * 60 * 60 * 1000);

export default function getGarbageTimer(pockestState) {
  if (typeof pockestState?.data?.monster?.stomach !== 'number') return null;
  if (pockestState?.data?.monster?.stomach === 12) return null;
  const stomachTimer = getStomachTimer(pockestState);
  const nextSmall = pockestState?.data?.next_small_event_timer;
  if (stomachTimer && stomachTimer !== nextSmall) return nextSmall;
  const now = (new Date()).getTime();
  const lastClean = pockestState?.log
    .reduce((recentCleanTs, entry) => {
      if (entry.logType !== 'cleaning') return recentCleanTs;
      const newTs = entry?.timestamp;
      if (now - newTs > pockestState?.data?.monster?.liveTime) return recentCleanTs;
      return (newTs > recentCleanTs) ? newTs : recentCleanTs;
    }, null);
  let nextClean = lastClean + GARBAGE_TIME;
  let nextStomach = pockestState.data.monster.stomach + 1;
  while (nextStomach < 12 && nextClean < now) {
    nextClean += GARBAGE_TIME;
    nextStomach += 1;
  }
  if (nextClean > now) return nextClean;
  return null;
}
