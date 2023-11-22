export default function getNextInterval(inceptionTimestamp, interval) {
  if (!inceptionTimestamp || !interval) return null;
  const now = new Date();
  const inception = new Date(inceptionTimestamp);
  const alive = now - inception;
  const intervalMs = interval * 60 * 60 * 1000;
  const inceptionOffset = Math.ceil(alive / intervalMs) * intervalMs;
  const next = new Date(inception.getTime() + inceptionOffset);
  return next?.getTime();
}
