import leadingZero from './leadingZero';

export function parseDuration(t) {
  const s = t / 1000;
  const m = s / 60;
  const h = m / 60;
  const d = h / 24;
  return {
    s,
    m,
    h,
    d,
  };
}

export function parseDurationStr(t) {
  const dur = parseDuration(t);
  const s = leadingZero(Math.floor(dur.s % 60));
  const m = leadingZero(Math.floor(dur.m % 60));
  const h = leadingZero(Math.floor(dur.h % 24));
  const d = Math.floor(dur.d);
  return `${d ? `${d}d ` : ''}${h}:${m}:${s}`;
}

export default parseDuration;
