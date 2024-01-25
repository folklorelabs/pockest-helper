import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { STAT_ABBR } from '../../config/stats';
import {
  pockestPlanSettings,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';

function AutoPlanSettingInput({ settingName }) {
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
  const isDisabled = React.useMemo(() => !pockestState?.autoPlan || targetMonster
    || !pockestState?.paused, [targetMonster, pockestState?.autoPlan, pockestState?.paused]);
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
    pockestDispatch(pockestPlanSettings(pockestState, { [settingName]: inputStr }));
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
      return `^[${validEggs}][5-5][ABC][LR][${validStats}]$`;
    } if (settingName === 'statPlanId') {
      return `^([${validStats}]{0,14})$`;
    }
    return '*';
  }, [pockestState?.allMonsters, settingName]);
  return (
    <input
      className={cx('AutoPlanSettingInput', 'PockestInput')}
      onChange={onChange}
      value={targetMonster ? pockestState?.[settingName] : newValue}
      disabled={isDisabled}
      pattern={pattern}
    />
  );
}

AutoPlanSettingInput.defaultProps = {

};

AutoPlanSettingInput.propTypes = {
  settingName: PropTypes.string.isRequired,
};

export default AutoPlanSettingInput;
