import React from 'react';
import { usePockestContext } from '../../contexts/PockestContext';
import { parseDurationStr } from '../../utils/parseDuration';
import getNextInterval from '../../utils/getNextInterval';
import TimerLine from './TimerLine';
import './index.css';

function Timers() {
  const [now, setNow] = React.useState(new Date());
  const { pockestState } = usePockestContext();
  const { data, feedInterval, cleanInterval } = pockestState;
  const nextFeed = React.useMemo(() => getNextInterval(
    data?.monster?.live_time,
    feedInterval,
  ), [data, feedInterval]);
  const nextClean = React.useMemo(() => {
    if (cleanInterval === 2) return new Date(data?.next_small_event_timer);
    return getNextInterval(
      data?.monster?.live_time,
      cleanInterval,
    );
  }, [data, cleanInterval]);
  const nextEvolution = React.useMemo(() => new Date(data?.next_big_event_timer), [data]);
  const nextMatch = React.useMemo(() => new Date(data?.monster?.exchange_time), [data]);
  const nextTrain = React.useMemo(() => new Date(data?.monster?.training_time), [data]);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="Timers">
      <TimerLine label="Next Cleaning" value={parseDurationStr(nextClean - now)} />
      <TimerLine label="Next Feeding" value={parseDurationStr(nextFeed - now)} />
      <TimerLine label="Next Training" value={parseDurationStr(nextTrain - now)} />
      <TimerLine label="Next Match" value={parseDurationStr(nextMatch - now)} />
      <TimerLine label="Next Evolution" value={parseDurationStr(nextEvolution - now)} />
    </div>
  );
}

export default Timers;
