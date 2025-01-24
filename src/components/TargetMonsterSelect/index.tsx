import React from 'react';
import {
  pockestGetters,
  pockestActions,
  usePockestContext,
} from '../../contexts/PockestContext';

interface TargetMonsterSelectProps {
  disabled?: boolean | null;
}

const TargetMonsterSelect: React.FC<TargetMonsterSelectProps> = ({ disabled }) => {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const targetableMonsters = React.useMemo(() => pockestGetters.getCurrentTargetableMonsters(pockestState), [pockestState]);
  const curMonsterNonHatchLogs = React.useMemo(
    () => pockestGetters.getCurrentMonsterLogs(pockestState).filter((l) => l.logType !== 'hatching'),
    [pockestState],
  );
  if (!targetableMonsters?.length) return '';
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        const shouldConfirm = pockestState?.data?.monster?.live_time
          && curMonsterNonHatchLogs.length;

        const shouldAbort = shouldConfirm && !window.confirm('Are you sure you want to change the target monster? Doing so at this time may result in unexpected results such as death or failure to evolve.');
        if (shouldAbort) {
          e.target.value = `${pockestState?.monsterId}`;
          e.preventDefault();
          return;
        }
        const monsterId = e.target.value ? parseInt(e.target.value, 10) : -1;
        if (pockestDispatch) pockestDispatch(pockestActions.pockestPlanSettings({
          monsterId,
        }));
      }}
      value={`${pockestState?.monsterId}`}
      disabled={disabled ?? (!pockestState?.autoPlan || !pockestState?.paused || pockestState?.autoQueue)}
    >
      <option key="custom" value="-1">
        [Custom Plan]
      </option>
      {targetableMonsters.map((monster) => (
        <option key={monster?.monster_id} value={monster?.monster_id}>
          {monster?.name_en || monster?.monster_id}
          {monster?.unlock ? ' ✓' : ''}
          {monster?.memento_flg ? ' ✓' : ''}
        </option>
      ))}
    </select>
  );
};

export default TargetMonsterSelect;
