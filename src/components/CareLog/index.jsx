import React from 'react';
import PropTypes from 'prop-types';
import {
  pockestClearLog,
  usePockestContext,
} from '../../contexts/PockestContext';
import monsters from '../../data/monsters.json';
import './index.css';
import { STAT_ID_ICON } from '../../config/stats';

function isMatchDiscovery(entry) {
  const monster = monsters.find((m) => m.monster_id === entry.monsterId);
  return [
    monster?.matchSusFever,
    monster?.matchUnknown,
    monster?.matchSusNormal,
  ].includes(entry.oppId);
}

function entryTemplate(entry) {
  const dateStr = (new Date(entry?.timestamp)).toLocaleString();
  const monster = monsters.find((m) => m.monster_id === entry?.monsterId);
  const emoji = (() => {
    if (entry?.logType === 'clean') return '💩';
    if (entry?.logType === 'meal') return '❤️';
    if (entry?.logType === 'training') return STAT_ID_ICON[entry?.statType];
    if (entry?.logType === 'match') return '🆚';
    if (entry?.logType === 'cure') return '🩹';
    if (entry?.logType === 'age') return '⬆️';
    if (entry?.logType === 'egg') return '🥚';
    return '';
  })();
  const entryStr = (() => {
    if (entry?.logType === 'clean') return `cleaned (${entry?.garbageBefore || 0} → 0)`;
    if (entry?.logType === 'meal') return `fed (${entry?.stomachBefore || 0} → ${(entry?.stomachBefore || 0) + 1})`;
    if (entry?.logType === 'training') return `trained ${entry?.statType} (+${entry?.statDiff})`;
    if (entry?.logType === 'match') {
      const isFever = entry.mementoDiff > entry.totalStats / 2;
      const b = monsters.find((m) => m.monster_id === entry.oppId);
      return `vs ${b.name_en} (+${entry?.mementoDiff}) ${isFever ? '<FEVER>' : ''}`;
    }
    if (entry?.logType === 'cure') return 'cured';
    if (entry?.logType === 'age') {
      const monsterBefore = monsters.find((m) => m.monster_id === entry?.monsterIdBefore);
      const newAge = parseInt(monster?.plan?.slice(1, 2) || '0', 10);
      return `aged ${newAge - 1} (${monsterBefore?.name_en}) → ${newAge} (${monster?.name_en})`;
    }
    if (entry?.logType === 'egg') return `hatched ${entry?.eggType}`;
    return '';
  })();
  return `[${dateStr}] ${emoji} ${monster.name_en} ${entryStr} `;
}

function CareLog({
  title,
  logTypes,
  rows,
  allowClear,
  onlyDiscoveries,
}) {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    log,
  } = pockestState;
  const careLogData = React.useMemo(
    () => {
      const d = log.filter((entry) => logTypes.includes(entry.logType));
      if (onlyDiscoveries) {
        return d.filter((entry) => entry.logType === 'match' && isMatchDiscovery(entry));
      }
      return d;
    },
    [log, logTypes, onlyDiscoveries],
  );
  const careLog = React.useMemo(() => careLogData
    .map((entry) => entryTemplate(entry)), [careLogData]);
  return (
    <div className="CareLog">
      <header className="CareLog-header">
        <p className="CareLog-title">
          {title}
          {' '}
          (
          {careLogData?.length || 0}
          )
        </p>
      </header>
      <div className="CareLog-content">
        <textarea
          className="CareLog-textarea"
          value={careLog.join('\n')}
          readOnly
          rows={rows}
        />
        <div
          className="CareLog-buttons"
        >
          <button
            type="button"
            className="PockestLink CareLog-copy"
            aria-label={`Copy ${title.toLowerCase()} to clipboard`}
            onClick={() => navigator.clipboard.writeText(careLog.join('\n'))}
          >
            📋 Copy
          </button>
          {allowClear ? (
            <button
              type="button"
              className="PockestLink CareLog-clear"
              aria-label={`Clear ${title.toLowerCase()}`}
              onClick={() => {
                const confirm = window.confirm(`Are you sure you want to permanently clear your ${title.toLowerCase()}?`);
                if (!confirm) return;
                pockestDispatch(pockestClearLog(pockestState, logTypes));
              }}
            >
              ❌ Clear
            </button>
          ) : ''}
        </div>
      </div>
    </div>
  );
}

CareLog.defaultProps = {
  title: 'Log',
  logTypes: ['clean', 'meal', 'training', 'match', 'age', 'egg', 'cure'],
  rows: 12,
  allowClear: true,
  onlyDiscoveries: false,
};

CareLog.propTypes = {
  title: PropTypes.string,
  logTypes: PropTypes.arrayOf(PropTypes.string),
  rows: PropTypes.number,
  allowClear: PropTypes.bool,
  onlyDiscoveries: PropTypes.bool,
};

export default CareLog;
