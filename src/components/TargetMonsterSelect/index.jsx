import React from 'react';
import {
  getMonsterId,
  pockestPlanSettings,
  usePockestContext,
} from '../../contexts/PockestContext';

function TargetMonsterSelect() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const acquiredMementos = React.useMemo(() => pockestState?.allMonsters
    ?.filter((m) => m?.memento_flg)
    .map((m) => m?.monster_id), [pockestState?.allMonsters]);
  const availableMonsters = React.useMemo(() => {
    const monster = pockestState?.data?.monster;
    const curMonsterId = getMonsterId(pockestState);
    if (!curMonsterId) {
      return pockestState?.allMonsters
        ?.filter((m) => {
          const mAgeStr = m?.plan?.slice(1, 2);
          const mAge = mAgeStr ? parseInt(mAgeStr, 10) : null;
          const hasRequiredMems = !m?.requiredMemento
            || acquiredMementos.includes(m.requiredMemento);
          return mAge >= 5 && hasRequiredMems;
        })
        .sort((a, b) => {
          if (a.name_en < b.name_en) return -1;
          if (b.name_en < a.name_en) return 1;
          return 0;
        });
    }
    const allAvailIds = pockestState?.allMonsters?.filter((m) => {
      const isOlder = m?.age > monster?.age;
      const hasRequiredMems = !m?.requiredMemento
        || acquiredMementos.includes(m.requiredMemento);
      return isOlder && hasRequiredMems;
    })
      .reduce((all, m) => {
        // only return decendants of current monster
        const match = m.from.find((pid) => pid === curMonsterId || all.includes(pid));
        if (!match) return all;
        return [
          ...all,
          m.monster_id,
        ];
      }, [curMonsterId]);
    return pockestState?.allMonsters
      .filter((m) => m?.age >= 5 && allAvailIds.includes(m?.monster_id))
      .sort((a, b) => {
        if (a.name_en < b.name_en) return -1;
        if (b.name_en < a.name_en) return 1;
        return 0;
      });
  }, [acquiredMementos, pockestState]);
  if (!pockestState?.allMonsters?.length) return '';
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        const monsterId = e.target.value ? parseInt(e.target.value, 10) : -1;
        pockestDispatch(pockestPlanSettings({
          ...pockestState,
          monsterId,
        }));
      }}
      defaultValue={`${pockestState?.monsterId}`}
      disabled={!pockestState?.autoPlan || !pockestState?.paused}
    >
      <option key="default" value="-1">
        --
      </option>
      {availableMonsters.map((monster) => (
        <option key={monster?.monster_id} value={monster?.monster_id}>
          {monster?.name_en || monster?.monster_id}
          {monster?.memento_flg ? ' ✓' : ''}
          {monster?.unlock ? ' ✓' : ''}
        </option>
      ))}
    </select>
  );
}

export default TargetMonsterSelect;
