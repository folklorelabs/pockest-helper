import React from 'react';
import PropTypes from 'prop-types';
import {
  pockestClearLog,
  usePockestContext,
} from '../../contexts/PockestContext';
import monsters from '../../data/monsters.json';
import './index.css';
import { STAT_ICON, STAT_ID } from '../../config/stats';

function isMatchDiscovery(entry) {
  const monster = monsters.find((m) => m.monster_id === entry?.monsterId);
  if (!entry?.result?.get_memento_point && !entry?.result?.get_egg_point) return false;
  const allMissing = [
    ...(monster?.matchSusFever || []),
    ...(monster?.matchUnknown || []),
    ...(monster?.matchSusNormal || []),
  ];
  return allMissing.includes(entry?.result?.target_monster_id);
}

function entryTemplate({ entry, noEmoji, noResults }) {
  const dateStr = (new Date(entry?.timestamp)).toLocaleString();
  const monster = monsters.find((m) => m.monster_id === entry?.monsterId);
  const logType = entry?.logType;
  const emoji = (() => {
    if (logType === 'cleaning') return '💩';
    if (logType === 'meal') return '❤️';
    if (logType === 'training') return STAT_ICON[entry?.result?.type];
    if (logType === 'exchange') return '🆚';
    if (logType === 'cure') return '🩹';
    if (logType === 'age') return '⬆️';
    if (logType === 'egg') return '🥚';
    return '';
  })();
  const actionStr = (() => {
    if (logType === 'cleaning') return 'cleaned';
    if (logType === 'meal') return 'fed';
    if (logType === 'training') return `trained ${STAT_ID[entry?.result?.type]}`;
    if (logType === 'exchange') {
      const b = monsters.find((m) => m.monster_id === entry?.result?.target_monster_id);
      return `vs ${b.name_en}`;
    }
    if (logType === 'cure') return 'cured';
    if (logType === 'age') return 'aged';
    if (logType === 'egg') return `hatched ${entry?.result?.eggType}`;
    return '';
  })();
  const tags = (() => {
    if (logType === 'exchange') {
      // const isFever = entry?.result?.is_spmatch;
      const expectedMemento = Math.ceil((entry?.result?.totalStats || 0) / 2);
      const expectedEgg = Math.ceil((entry?.result?.totalStats || 0) / 5);
      const isFever = entry?.result?.get_memento_point > expectedMemento
        || entry?.result?.get_egg_point > expectedEgg;
      return [
        entry?.result?.is_spmatch && 'FEVER',
        isFever && 'FEVER_CALC',
        !entry?.result?.is_spmatch && !isFever && 'NO_FEVER',
      ];
    }
    return [];
  })().filter((g) => g).map((g) => `<${g}>`).join(' ');
  const resultsStr = (() => {
    if (logType === 'age') return [`${entry?.result?.monsterBefore?.name_en} → ${monster?.name_en}`];
    if (logType === 'cleaned') return [`${entry?.result?.garbageBefore || 0} → 0`];
    if (logType === 'meal') return [`${(entry?.result?.stomach || 0) - 1} → ${entry?.result?.stomach || 0}`];
    if (logType === 'training') return [`+${entry?.result?.up_status}`];
    if (logType === 'exchange') {
      return [
        entry?.result?.get_memento_point && `🎁+${entry?.result?.get_memento_point}`,
        entry?.result?.get_egg_point && `🥚+${entry?.result?.get_egg_point}`,
        // entry?.result?.memento_get && 'GOT_MEMENTO',
      ];
    }
    return [];
  })().filter((g) => g).join(', ');
  return `[${dateStr}]${!noEmoji ? ` ${emoji}` : ''}${tags ? ` ${tags}` : ''} ${monster.name_en} ${actionStr}${resultsStr && !noResults ? ` (${resultsStr})` : ''}`;
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
        return d.filter((entry) => entry.logType === 'exchange' && isMatchDiscovery(entry));
      }
      return d;
    },
    [log, logTypes, onlyDiscoveries],
  );
  const careLog = React.useMemo(() => careLogData
    .map((entry) => entryTemplate({
      entry,
      noEmoji: onlyDiscoveries,
      noResults: onlyDiscoveries,
    })), [careLogData, onlyDiscoveries]);
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
                const confirm = window.confirm(`Are you sure you want to permanently clear your ${title.toLowerCase()}? This will include any newly discovered fever matches.`);
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
  logTypes: ['cleaning', 'meal', 'training', 'exchange', 'age', 'egg', 'cure'],
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
