import React from 'react';
import {
  getMonsterId,
  pockestAutoPlan,
  pockestSettings,
  usePockestContext,
} from '../../contexts/PockestContext';

function TargetMonsterSelect() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const availableMonsters = React.useMemo(() => {
    const monster = pockestState?.data?.monster;
    const curMonsterId = getMonsterId(pockestState);
    if (!curMonsterId) {
      return pockestState?.allMonsters?.filter((m) => {
        const mAgeStr = m?.plan?.slice(1, 2);
        const mAge = mAgeStr ? parseInt(mAgeStr, 10) : null;
        return mAge >= 5;
      }).filter((m) => {
        // check for any required mementos
        if (!m?.requiredMemento) return true;
        const reqM = pockestState?.allMonsters
          ?.find((rm) => rm?.monster_id === m?.requiredMemento?.monster_id);
        return reqM?.memento_flg;
      }).sort((a, b) => {
        if (a.name_en < b.name_en) return -1;
        if (b.name_en < a.name_en) return 1;
        return 0;
      });
    }
    const allAvailIds = pockestState?.allMonsters?.filter((m) => m?.age > monster?.age)
      .filter((m) => {
        // check for any required mementos
        if (!m?.requiredMemento) return true;
        const reqM = pockestState?.allMonsters
          ?.find((rm) => rm?.monster_id === m?.requiredMemento?.monster_id);
        return reqM?.memento_flg;
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
  }, [pockestState]);
  if (!pockestState?.allMonsters?.length) return '';
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        const monsterId = e.target.value ? parseInt(e.target.value, 10) : -1;
        if (pockestState?.autoPlan) {
          pockestDispatch(pockestAutoPlan({
            autoPlan: true,
            monsterId,
            pockestState,
          }));
        } else {
          pockestDispatch(pockestSettings({ monsterId }));
        }
      }}
      defaultValue={`${pockestState?.monsterId}`}
      disabled={!pockestState?.paused}
    >
      <option key="default" value="-1">
        --
      </option>
      {availableMonsters.map((monster) => (
        <option key={monster?.monster_id} value={monster?.monster_id}>
          {monster.name_en}
        </option>
      ))}
    </select>
  );
}

export default TargetMonsterSelect;
