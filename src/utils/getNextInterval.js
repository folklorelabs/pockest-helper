export default function getNextInterval(birthTimestamp, interval) {
  const now = new Date();
  const birth = new Date(birthTimestamp);
  const alive = now - birth;
  const intervalMs = interval * 60 * 60 * 1000;
  const birthOffset = Math.ceil(alive / intervalMs) * intervalMs;
  return new Date(birth.getTime() + birthOffset);
}
