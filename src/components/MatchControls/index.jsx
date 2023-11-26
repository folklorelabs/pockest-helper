import React from 'react';
import {
  usePockestContext,
  pockestSettings,
} from '../../contexts/PockestContext';
import {
  useAppContext,
} from '../../contexts/AppContext';
import { parseDurationStr } from '../../utils/parseDuration';
import useNow from '../../hooks/useNow';
import './index.css';

function MatchControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const { setShowLog } = useAppContext();
  const now = useNow();
  const {
    data,
    autoMatch,
    paused,
    matchPriority,
    log,
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
            defaultChecked={autoMatch}
            disabled={!paused}
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
            Points
          </option>
          <option key="1" value="1">
            No fever
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
      <div className="PockestLine">
        <span className="PockestText">
          Matches
        </span>
        <button
          type="button"
          className="PockestText PockestLine-value PockestLink"
          onClick={() => {
            setShowLog(true);
          }}
        >
          {log?.match?.length ?? '--'}
        </button>
      </div>
    </div>
  );
}

export default MatchControls;
