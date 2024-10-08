import React from 'react';
import PropTypes from 'prop-types';
import {
  pockestGetters,
  pockestActions,
  usePockestContext,
} from '../../contexts/PockestContext';
import { getCurrentMonsterLogs } from '../../contexts/PockestContext/getters';

function TargetMonsterSelect({ disabled }) {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const acquiredMementos = React.useMemo(
    () => pockestGetters.getOwnedMementoMonsterIds(pockestState),
    [pockestState],
  );
  const availableMonsters = React.useMemo(() => {
    const monster = pockestState?.data?.monster;
    const curMonsterId = pockestGetters.getMonsterId(pockestState);
    if (!curMonsterId) {
      return pockestState?.allMonsters
        ?.filter((m) => m.confirmed)
        ?.filter((m) => {
          const mAgeStr = m?.planId?.slice(-1);
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
    const allAvailIds = pockestState?.allMonsters
      ?.filter((m) => {
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
      ?.filter((m) => m.confirmed)
      ?.filter((m) => m?.age >= 5 && allAvailIds.includes(m?.monster_id))
      ?.filter((m) => !pockestState?.eggId || m?.eggIds?.includes(pockestState?.eggId))
      ?.sort((a, b) => {
        if (a.name_en < b.name_en) return -1;
        if (b.name_en < a.name_en) return 1;
        return 0;
      });
  }, [acquiredMementos, pockestState]);
  const curMonsterNonHatchLogs = React.useMemo(
    () => getCurrentMonsterLogs(pockestState).filter((l) => l.logType !== 'hatching'),
    [pockestState],
  );
  if (!pockestState?.allMonsters?.length) return '';
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        const shouldConfirm = pockestState?.data?.monster?.live_time
          && curMonsterNonHatchLogs.length;
        // eslint-disable-next-line no-alert
        const shouldAbort = shouldConfirm && !window.confirm('Are you sure you want to change the target monster? Doing so at this time may result in unexpected results such as death or failure to evolve.');
        if (shouldAbort) {
          e.target.value = `${pockestState?.monsterId}`;
          e.preventDefault();
          return;
        }
        const monsterId = e.target.value ? parseInt(e.target.value, 10) : -1;
        pockestDispatch(pockestActions.pockestPlanSettings(pockestState, {
          monsterId,
        }));
      }}
      defaultValue={`${pockestState?.monsterId}`}
      disabled={disabled ?? (!pockestState?.autoPlan || !pockestState?.paused)}
    >
      <option key="default" value="-1">
        [Custom Plan]
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

TargetMonsterSelect.defaultProps = {
  disabled: null,
};

TargetMonsterSelect.propTypes = {
  disabled: PropTypes.bool,
};

export default TargetMonsterSelect;
