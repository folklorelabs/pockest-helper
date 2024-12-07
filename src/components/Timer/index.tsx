import React from 'react';
import { parseDurationStr } from '../../utils/parseDuration';
import TimerLine from './TimerLine';
import useNow from '../../hooks/useNow';
import './index.css';

interface TimerProps {
  label: string | React.ReactNode;
  timestamp?: number | null;
  value?: string | null;
}

function Timer({ label, timestamp = null, value = null }: TimerProps) {
  const now = useNow();
  const v = (() => {
    if (value) return value;
    if (timestamp) return parseDurationStr(timestamp - now);
    return '--';
  })();
  return (
    <TimerLine label={label} value={v} />
  );
}

export default Timer;
