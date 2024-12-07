/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React from 'react';
import { STAT_ABBR } from '../../constants/stats';
import {
  pockestActions,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';

interface AutoPlanSettingInputProps {
  settingName: string;
  required?: boolean;
  disabled?: boolean | null;
}

function AutoPlanSettingInput({ settingName, required = false, disabled = null }: AutoPlanSettingInputProps) {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const [newValue, setNewValue] = React.useState(pockestState?.[settingName]);
  const targetMonster = React.useMemo(
    () => pockestState?.allMonsters
      ?.find((m) => m.monster_id === pockestState?.monsterId),
    [pockestState?.allMonsters, pockestState?.monsterId],
  );
  React.useEffect(() => {
    if (targetMonster) {
      setNewValue(pockestState?.[settingName]);
    }
  }, [pockestState, settingName, targetMonster]);
  const onChange = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const inputStr = e?.currentTarget?.value;
    setNewValue(inputStr);
    const invalidInput = e?.currentTarget?.validity?.patternMismatch;
    if (invalidInput) return;
    if (pockestDispatch) pockestDispatch(pockestActions.pockestPlanSettings({
      [settingName]: inputStr,
    }));
  }, [pockestDispatch, settingName]);
  const pattern = React.useMemo(() => {
    const validStats = Object.keys(STAT_ABBR).join('');
    if (settingName === 'planId') {
      return `^[\\d*][ABC][LR][${validStats}][1-6]$`;
    } if (settingName === 'statPlanId') {
      return `^([${validStats}]{0,14})$`;
    }
    return '*';
  }, [settingName]);
  return (
    <div className="AutoPlanSettingInput">
      <input
        className="PockestInput"
        onChange={onChange}
        value={targetMonster ? pockestState?.[settingName] : newValue}
        disabled={disabled ?? (!pockestState?.autoPlan || !!targetMonster || !pockestState?.paused || pockestState.autoQueue)}
        pattern={pattern}
        required={required}
      />
      <span className="AutoPlanSettingInput-overlay" />
    </div>
  );
}

export default AutoPlanSettingInput;
