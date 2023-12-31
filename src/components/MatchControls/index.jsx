import React from 'react';
import {
  usePockestContext,
  pockestSettings,
} from '../../contexts/PockestContext';
import LogCountLine from '../LogCountLine';
import { parseDurationStr } from '../../utils/parseDuration';
import useNow from '../../hooks/useNow';
import './index.css';

function MatchControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const now = useNow();
  const {
    data,
    autoMatch,
    autoPlan,
    paused,
    matchPriority,
  } = pockestState;
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
            disabled={!paused || (autoPlan && data?.monster?.age < 4)}
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
          disabled={!paused || (autoPlan && data?.monster?.age < 4)}
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
          {data?.monster?.exchange_time ? parseDurationStr(data.monster.exchange_time - now.getTime()) : '--'}
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
