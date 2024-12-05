import React from 'react';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import Timer from '../Timer';
import Memento from '../Memento';
import getAgeTimer from '../../utils/getAgeTimer';
import getStunTimer from '../../utils/getStunTimer';
import getDeathTimer from '../../utils/getDeathTimer';
import './index.css';

function StatusTimers() {
  const {
    pockestState,
  } = usePockestContext();
  const {
    data,
  } = pockestState;
  const curAge = data?.monster?.age;
  const ageTimer = React.useMemo(() => getAgeTimer(pockestState), [pockestState]);
  const stunTimer = React.useMemo(() => {
    const st = getStunTimer(pockestState);
    if (typeof st !== 'number' || typeof ageTimer !== 'number' || typeof curAge !== 'number') return null;
    return st > ageTimer && curAge >= 5 ? null : st;
  }, [pockestState, ageTimer, curAge]);
  const deathTimer = React.useMemo(() => {
    const dt = getDeathTimer(pockestState);
    if (typeof dt !== 'number' || typeof ageTimer !== 'number' || typeof curAge !== 'number') return null;
    return dt > ageTimer && curAge >= 5 ? null : dt;
  }, [pockestState, ageTimer, curAge]);
  const ageLabel = React.useMemo(() => {
    if (typeof curAge !== 'number') return 'Age 0 → 1';
    if (curAge < 5) return `Age ${curAge} → ${curAge + 1}`;
    return (
      <>
        {`Age ${curAge} → `}
        <Memento />
      </>
    );
  }, [curAge]);
  return (
    <div className="StatusTimers">
      <Timer
        label={ageLabel}
        timestamp={getAgeTimer(pockestState)}
      />
      <Timer
        label="Stun"
        timestamp={stunTimer}
        value={!stunTimer && data?.next_small_event_timer ? '??' : null}
      />
      <Timer
        label="Death"
        timestamp={deathTimer}
        value={!deathTimer && data?.next_small_event_timer ? '??' : null}
      />
    </div>
  );
}

export default StatusTimers;
