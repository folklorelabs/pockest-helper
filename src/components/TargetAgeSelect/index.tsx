import React from 'react';
import {
  pockestActions,
  usePockestContext,
} from '../../contexts/PockestContext';

// TYPES
interface TargetAgeSelectProps {
  disabled?: boolean | null;
}

// CONSTS
const AGE_INTERVAL = {
  6: '6 (Memento + Sticker)',
  5: '5 (Sticker)',
  // 4: '4',
  // 3: '3',
  // 2: '2',
  1: '1 (Do nothing)',
};

function TargetAgeSelect({ disabled }: TargetAgeSelectProps) {
  const { pockestState, pockestDispatch } = usePockestContext();
  const { paused, planAge } = pockestState;
  const targetMonster = React.useMemo(
    () =>
      pockestState?.allMonsters?.find(
        (m) => m.monster_id === pockestState?.monsterId,
      ),
    [
      pockestState?.allMonsters,
      pockestState?.monsterId,
    ],
  );
  return (
    <select
      className="PockestSelect"
      onChange={(e) => {
        if (pockestDispatch) {
          pockestDispatch(
            pockestActions.pockestPlanSettings({
              planAge: parseInt(e.target.value, 10),
            }),
          );
        }
      }}
      value={planAge}
      disabled={
        disabled ??
        (!pockestState?.autoPlan ||
          !paused ||
          !targetMonster ||
          pockestState.autoQueue)
      }
    >
      {Object.keys(AGE_INTERVAL).map((k) => (
        <option key={k} value={k}>
          {AGE_INTERVAL[k as unknown as keyof typeof AGE_INTERVAL]}
        </option>
      ))}
    </select>
  );
}

export default TargetAgeSelect;
