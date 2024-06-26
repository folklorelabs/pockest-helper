import React from 'react';
import PropTypes from 'prop-types';
import { STAT_ABBR } from '../../config/stats';
import {
  pockestPlanSettings,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';

function AutoPlanSettingInput({ settingName, required }) {
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
  const onChange = React.useCallback((e) => {
    const inputStr = e?.target?.value;
    setNewValue(inputStr);
    const invalidInput = e?.target?.validity?.patternMismatch;
    if (invalidInput) return;
    pockestDispatch(pockestPlanSettings({
      ...pockestState,
      [settingName]: inputStr,
    }));
  }, [pockestDispatch, pockestState, settingName]);
  const pattern = React.useMemo(() => {
    const validStats = Object.keys(STAT_ABBR).join('');
    if (settingName === 'planId') {
      const validEggs = pockestState?.allMonsters.reduce((acc, mon) => {
        const monEgg = mon?.plan?.slice(0, 1);
        if (!monEgg) return acc;
        if (!acc.includes(monEgg)) acc.push(monEgg);
        return acc;
      }, []).join('');
      return `^[${validEggs}][1-6][ABC][LR][${validStats}]$`;
    } if (settingName === 'statPlanId') {
      return `^([${validStats}]{0,14})$`;
    }
    return '*';
  }, [pockestState?.allMonsters, settingName]);
  return (
    <div className="AutoPlanSettingInput">
      <input
        className="PockestInput"
        onChange={onChange}
        value={targetMonster ? pockestState?.[settingName] : newValue}
        disabled={!pockestState?.autoPlan || targetMonster || !pockestState?.paused}
        pattern={pattern}
        required={required}
      />
      <span className="AutoPlanSettingInput-overlay" />
    </div>
  );
}

AutoPlanSettingInput.defaultProps = {
  required: false,
};

AutoPlanSettingInput.propTypes = {
  settingName: PropTypes.string.isRequired,
  required: PropTypes.bool,
};

export default AutoPlanSettingInput;
