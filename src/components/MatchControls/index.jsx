import React from 'react';
import {
  usePockestContext,
  pockestSettings,
} from '../../contexts/PockestContext';
import LogCountLine from '../LogCountLine';
import { parseDurationStr } from '../../utils/parseDuration';
import getMatchTimer from '../../utils/getMatchTimer';
import useNow from '../../hooks/useNow';
import getAgeTimer from '../../utils/getAgeTimer';
import './index.css';

function MatchControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const now = useNow();
  const {
    autoMatch,
    autoPlan,
    paused,
    matchPriority,
  } = pockestState;
  const ageTimer = React.useMemo(() => getAgeTimer(pockestState), [pockestState]);
  const nextMatchTimer = React.useMemo(() => {
    const mt = getMatchTimer(pockestState);
    return mt > ageTimer && pockestState?.data?.monster?.age >= 5 ? null : mt;
  }, [pockestState, ageTimer]);
  return (
    <div className="MatchControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoMatch">
          <input
            id="PockestHelper_AutoMatch"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoMatch: e.target.checked }))}
            checked={autoMatch}
            disabled={!paused || autoPlan}
          />
          <span className="PockestCheck-text">Match</span>
        </label>
      </div>
      <div className="PockestLine">
        <span className="PockestText">
          Priority
        </span>
        <select
          className="PockestSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ matchPriority: parseInt(e.target.value, 10) }));
          }}
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
        <span className="PockestText">
          Next Match
        </span>
        <span className="PockestText PockestLine-value">
          {nextMatchTimer ? parseDurationStr(nextMatchTimer - now.getTime()) : '--'}
        </span>
      </div>
      <LogCountLine
        title="Matches"
        logTypes={['exchange']}
      />
    </div>
  );
}

export default MatchControls;
