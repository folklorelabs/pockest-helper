import PockestState from "../contexts/PockestContext/types/PockestState";

export const STOMACH_TIME = (4 * 60 * 60 * 1000);

export default function getStomachTimer(pockestState: PockestState) {
  const birth = pockestState?.data?.monster?.live_time;
  if (!birth) return null;
  const nextSmall = pockestState?.data?.next_small_event_timer;
  if (nextSmall && (nextSmall - birth) % STOMACH_TIME === 0) return nextSmall;
  const now = (new Date()).getTime();
  const nextStomachCount = Math.ceil((now - birth) / STOMACH_TIME);
  return birth + (nextStomachCount * STOMACH_TIME);
}
