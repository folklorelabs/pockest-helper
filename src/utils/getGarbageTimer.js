import getStomachTimer from './getStomachTimer';

export const GARBAGE_TIME = (2 * 60 * 60 * 1000);

export default function getGarbageTimer(pockestState) {
  const stomachTimer = getStomachTimer(pockestState);
  const nextSmall = pockestState?.data?.next_small_event_timer;
  if (stomachTimer && stomachTimer !== nextSmall) return nextSmall;
  const lastClean = pockestState?.log
    .filter((entry) => entry.logType === 'cleaning')
    .reduce((recentCleanTs, entry) => {
      const newTs = entry?.timestamp;
      const now = (new Date()).getTime();
      if (now - newTs > GARBAGE_TIME) return recentCleanTs;
      return (newTs > recentCleanTs) ? newTs : recentCleanTs;
    }, null);
  if (lastClean) return lastClean + GARBAGE_TIME;
  return null;
}
