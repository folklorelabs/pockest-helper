import React from 'react';
import {
  pockestActions,
  usePockestContext,
} from '../../contexts/PockestContext';
import useNow from '../../hooks/useNow';
import getAgeTimer from '../../utils/getAgeTimer';
import getMatchTimer from '../../utils/getMatchTimer';
import { parseDurationStr } from '../../utils/parseDuration';
import LogCountLine from '../LogCountLine';
import './index.css';

function MatchControls() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const now = useNow();
  const { autoMatch, autoPlan, paused, matchPriority } = pockestState;
  const ageTimer = React.useMemo(
    () => getAgeTimer(pockestState),
    [
      pockestState,
    ],
  );
  const nextMatchTimer = React.useMemo(() => {
    const timer = getMatchTimer(pockestState);
    if (
      typeof timer !== 'number' ||
      typeof ageTimer !== 'number' ||
      typeof pockestState?.data?.monster?.age !== 'number'
    )
      return null;
    return timer > ageTimer && pockestState?.data?.monster?.age >= 5
      ? null
      : timer;
  }, [
    pockestState,
    ageTimer,
  ]);
  return (
    <div className="MatchControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoMatch">
          <input
            id="PockestHelper_AutoMatch"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) =>
              pockestDispatch &&
              pockestDispatch(
                pockestActions.pockestSettings({
                  autoMatch: e.target.checked,
                }),
              )
            }
            checked={autoMatch}
            disabled={!paused || autoPlan}
          />
          <span className="PockestCheck-text">Match</span>
        </label>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Priority</span>
        <select
          className="PockestSelect"
          onChange={(e) =>
            pockestDispatch &&
            pockestDispatch(
              pockestActions.pockestSettings({
                matchPriority: parseInt(e.target.value, 10),
              }),
            )
          }
          value={matchPriority || ''}
          disabled={!paused}
        >
          <option key="0" value="0">
            Discovery
          </option>
          <option key="1" value="1">
            Points
          </option>
        </select>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Next Match</span>
        <span className="PockestText PockestLine-value">
          {nextMatchTimer ? parseDurationStr(nextMatchTimer - now) : '--'}
        </span>
      </div>
      <LogCountLine
        title="Matches"
        logTypes={[
          'exchange',
        ]}
      />
    </div>
  );
}

export default MatchControls;
