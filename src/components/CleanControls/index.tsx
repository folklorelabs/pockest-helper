import React from 'react';
import {
  pockestActions,
  usePockestContext,
  pockestGetters,
} from '../../contexts/PockestContext';
import useNow from '../../hooks/useNow';
import { parseDurationStr } from '../../utils/parseDuration';
import getGarbageTimer from '../../utils/getGarbageTimer';
import LogCountLine from '../LogCountLine';
import getAgeTimer from '../../utils/getAgeTimer';
import './index.css';

// CONSTS
const CLEAN_INTERVAL: Record<number, string> = {
  2: 'Every 2h',
  4: 'Every 4h',
  12: 'Every 12h',
  24: 'Every 24h',
  36: 'Every 36h',
};

function CleanControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const now = useNow();
  const {
    currentCleanWindow,
    nextCleanWindow,
  } = React.useMemo(
    () => pockestGetters.getCurrentPlanScheduleWindows(pockestState),
    [pockestState],
  );
  const ageTimer = React.useMemo(() => getAgeTimer(pockestState), [pockestState]);
  const garbageTimer = React.useMemo(() => {
    const timer = getGarbageTimer(pockestState);
    if (typeof timer !== 'number' || typeof ageTimer !== 'number' || typeof pockestState?.data?.monster?.age !== 'number') return null;
    return timer > ageTimer && pockestState?.data?.monster?.age >= 5 ? null : timer;
  }, [pockestState, ageTimer]);

  const {
    data,
    autoPlan,
    autoClean,
    paused,
    cleanFrequency,
  } = pockestState;
  return (
    <div className="CleanControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoClean">
          <input
            id="PockestHelper_AutoClean"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch && pockestDispatch(pockestActions.pockestSettings({
              autoClean: e.target.checked,
            }))}
            checked={autoClean}
            disabled={!paused || autoPlan}
          />
          <span className="PockestCheck-text">Clean</span>
        </label>
        <span className="PockestText">
          <span className="PockestIcon">💩</span>
          {' '}
          {typeof data?.monster?.garbage === 'number' ? `${data?.monster?.garbage}/12` : '--'}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">
          Next Poop
        </span>
        <span className="PockestText PockestLine-value">
          {(() => {
            const nextSmall = data?.next_small_event_timer;
            if (!nextSmall) return '--';
            if (!garbageTimer) return '??';
            return parseDurationStr(garbageTimer - now);
          })()}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Clean Frequency</span>
        <select
          className="PockestSelect"
          onChange={(e) => pockestDispatch && pockestDispatch(pockestActions.pockestSettings({
            cleanFrequency: parseInt(e.target.value, 10),
          }))}
          value={cleanFrequency}
          disabled={!paused || autoPlan}
        >
          {Object.keys(CLEAN_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {CLEAN_INTERVAL[parseInt(k, 10)]}
            </option>
          ))}
        </select>
      </div>
      <div className="PockestLine">
        <span className="PockestText">
          Next Clean
        </span>
        <span className="PockestText PockestLine-value">
          {(() => {
            if (cleanFrequency === 2 || !nextCleanWindow) return '--';
            return parseDurationStr(nextCleanWindow.start - now);
          })()}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">
          Current Clean
        </span>
        <span className="PockestText PockestLine-value">
          {(() => {
            if (cleanFrequency === 2) return '∞';
            if (!currentCleanWindow) return '--';
            return parseDurationStr(currentCleanWindow.end - now);
          })()}
        </span>
      </div>
      <LogCountLine
        title="Cleanings"
        logTypes={['cleaning']}
      />
    </div>
  );
}

export default CleanControls;
