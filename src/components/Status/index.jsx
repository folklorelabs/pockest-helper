import React from 'react';
import { usePockestContext } from '../../contexts/PockestContext';
import { parseDurationStr } from '../../utils/parseDuration';
import StatusLine from './StatusLine';
import './index.css';

function Status() {
  const [now, setNow] = React.useState(new Date());
  const { pockestState } = usePockestContext();
  const { data } = pockestState;
  const nextFeed = React.useMemo(() => {
    const birth = new Date(data?.monster?.live_time);
    const alive = now - birth;
    const feedCycleMs = 4 * 60 * 60 * 1000;
    const birthOffset = Math.ceil(alive / feedCycleMs) * feedCycleMs;
    return new Date(birth.getTime() + birthOffset);
  }, [now, data]);
  const nextSmall = React.useMemo(() => new Date(data?.next_small_event_timer), [data]);
  const nextBig = React.useMemo(() => new Date(data?.next_big_event_timer), [data]);
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
    <div className="Status">
      <p className="StatusHeader">
        <span className="StatusHeader-item">
          Age
          {' '}
          {data?.monster?.age}
        </span>
        <span className="StatusHeader-item">
          ❤️
          {' '}
          {data?.monster?.stomach}
        </span>
        <span className="StatusHeader-item">
          💩
          {' '}
          {data?.monster?.garbage}
        </span>
      </p>
      <StatusLine label="Next Feeding" value={parseDurationStr(nextFeed - now)} />
      <StatusLine label="Next Cleaning" value={parseDurationStr(nextSmall - now)} />
      <StatusLine label="Next Training" value={parseDurationStr(nextTrain - now)} />
      <StatusLine label="Next Match" value={parseDurationStr(nextMatch - now)} />
      <StatusLine label="Next Evolution" value={parseDurationStr(nextBig - now)} />
    </div>
  );
}

export default Status;
