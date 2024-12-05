import leadingZero from './leadingZero';

export function parseDuration(ms) {
  const s = ms / 1000;
  const m = s / 60;
  const h = m / 60;
  const d = h / 24;
  return {
    ms,
    s,
    m,
    h,
    d,
  };
}

export function parseDurationStr(t) {
  const dur = parseDuration(t);
  const s = leadingZero(Math.floor(Math.max(dur.s, 0) % 60));
  const m = leadingZero(Math.floor(Math.max(dur.m, 0) % 60));
  const h = leadingZero(Math.floor(Math.max(dur.h, 0) % 24));
  const d = Math.floor(Math.max(dur.d, 0));
  return `${d ? `${d}d ` : ''}${h}:${m}:${s}`;
}

export default parseDuration;
