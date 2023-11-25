import React from 'react';
import {
  usePockestContext,
  pockestSettings,
  getMonsterId,
} from '../../contexts/PockestContext';
import { parseDurationStr } from '../../utils/parseDuration';
import useNow from '../../hooks/useNow';
import MatchUpSelect from '../MatchUpSelect';
import './index.css';
import monsters from '../../data/monsters';

function MatchControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const now = useNow();
  const curMonsterId = React.useMemo(() => getMonsterId(pockestState), [pockestState]);
  const matchTargets = React.useMemo(() => {
    if (pockestState?.matchPreference) {
      const targetMonster = monsters.find((m) => m.monster_id === pockestState?.matchPreference);
      return targetMonster?.name_en;
    }
    const curMonster = monsters.find((m) => m.monster_id === curMonsterId);
    const targets = curMonster?.matchFever?.map((id) => monsters.find((m) => m.monster_id === id));
    return targets?.map((t) => t.name_en).join(', ');
  }, [pockestState, curMonsterId]);
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
      <div className="PockestLine">
        <span className="PockestText">
          Target
        </span>
        <span className="PockestText PockestLine-value">
          {matchTargets ?? '--'}
        </span>
      </div>
    </div>
  );
}

export default MatchControls;
