import React from 'react';
import {
  getMonsterId,
  pockestSettings,
  usePockestContext,
} from '../../contexts/PockestContext';
import useMonsters from '../../hooks/useMonsters';

function TargetMonsterSelect() {
  const allMonsters = useMonsters();
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const availableMonsters = React.useMemo(() => {
    const monster = pockestState?.data?.monster;
    const curMonsterId = getMonsterId(pockestState);
    const allAvailIds = allMonsters
      .filter((m) => m.age > monster.age)
      .reduce((all, m) => {
        const match = m.from.find((pid) => pid === curMonsterId || all.includes(pid));
        if (!match) return all;
        return [
          ...all,
          m.monster_id,
        ];
      }, []);
    return allMonsters
      .filter((m) => m.age >= 5 && allAvailIds.includes(m.monster_id));
  }, [pockestState, allMonsters]);
  const {
    data,
    monsterId,
    paused,
  } = pockestState;
  if (!data?.monster || !allMonsters.length) return '';
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        pockestDispatch(pockestSettings({ monsterId: parseInt(e.target.value, 10) }));
      }}
      defaultValue={`${monsterId}`}
      disabled={!paused}
    >
      {availableMonsters.map((monster) => (
        <option key={monster.monster_id} value={monster.monster_id}>
          {monster.name_en}
        </option>
      ))}
    </select>
  );
}

export default TargetMonsterSelect;
