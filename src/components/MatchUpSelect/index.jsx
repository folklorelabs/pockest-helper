import React from 'react';
import {
  pockestGetters,
  pockestActions,
  usePockestContext,
} from '../../contexts/PockestContext';

function MatchUpSelect() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    data,
    matchPreference,
    paused,
    allMonsters,
  } = pockestState;
  const monsterId = React.useMemo(() => pockestGetters.getMonsterId(pockestState), [pockestState]);
  const curMonster = React.useMemo(() => allMonsters
    .find((m) => m.monster_id === monsterId), [allMonsters, monsterId]);
  const sortedMonsters = React.useMemo(() => allMonsters
    .filter((m) => m?.age >= data?.monster?.age)
    .sort((a, b) => {
      const matchFever = curMonster?.matchFever;
      const aFever = matchFever?.includes(a?.monster_id);
      const bFever = matchFever?.includes(b?.monster_id);
      if (aFever && !bFever) return -1;
      if (bFever && !aFever) return 1;
      if (a?.name_en < b?.name_en) return -1;
      if (b?.name_en < a?.name_en) return 1;
      return 0;
    }), [allMonsters, curMonster?.matchFever, data?.monster?.age]);
  if (!allMonsters?.length) return '';
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        pockestDispatch(pockestActions.pockestSettings({
          matchPreference: parseInt(e.target.value, 10),
        }));
      }}
      value={matchPreference || ''}
      disabled={!paused}
    >
      <option key="default" value="" style={{ opacity: 0.5 }}>
        Auto-Fever
      </option>
      {sortedMonsters.map((monster) => (
        <option key={monster?.monster_id} value={monster?.monster_id}>
          {monster?.name_en}
          {' '}
          {curMonster?.matchFever?.includes(monster?.monster_id) ? '🔥' : ''}
        </option>
      ))}
    </select>
  );
}

export default MatchUpSelect;
