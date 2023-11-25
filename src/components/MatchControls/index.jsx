import React from 'react';
import {
  usePockestContext,
  pockestSettings,
} from '../../contexts/PockestContext';
import './index.css';
import { parseDurationStr } from '../../utils/parseDuration';
import useNow from '../../hooks/useNow';
import MatchUpSelect from '../MatchUpSelect';

function MatchControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const now = useNow();
  const {
    data,
    autoMatch,
    paused,
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
        <span className="PockestText">Preference</span>
        <MatchUpSelect />
      </div>
      <div className="PockestLine">
        <span className="PockestText">
          Next Match
        </span>
        <span className="PockestText PockestLine-value">
          {data?.monster?.exchange_time ? parseDurationStr(data.monster.exchange_time - now.getTime()) : '--'}
        </span>
      </div>
    </div>
  );
}

export default MatchControls;
