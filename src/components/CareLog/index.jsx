import React from 'react';
import PropTypes from 'prop-types';
import {
  pockestClearLog,
  usePockestContext,
} from '../../contexts/PockestContext';
import { STAT_ICON, STAT_ID } from '../../config/stats';
import './index.css';

function isMatchDiscovery(allMonsters, entry) {
  const monster = allMonsters.find((m) => m.monster_id === entry?.monsterId);
  if (!entry?.get_memento_point && !entry?.get_egg_point) return false;
  const allMissing = [
    ...(monster?.matchSusFever || []),
    ...(monster?.matchUnknown || []),
    ...(monster?.matchSusNormal || []),
  ];
  return allMissing.includes(entry?.target_monster_id);
}

function entryTemplate({ allMonsters, entry, reporting }) {
  const dateStr = (new Date(entry?.timestamp)).toLocaleString();
  const monster = allMonsters.find((m) => m.monster_id === entry?.monsterId);
  const logType = entry?.logType;
  const actionStr = (() => {
    if (logType === 'cleaning') return 'cleaned';
    if (logType === 'meal') return 'fed';
    if (logType === 'training') return `trained ${STAT_ID[entry?.type]}`;
    if (logType === 'exchange') {
      const b = allMonsters.find((m) => m.monster_id === entry?.target_monster_id);
      return `vs ${b.name_en}`;
    }
    if (logType === 'cure') return 'cured 🩹';
    if (logType === 'age') return `aged ⬆️ ${entry?.monsterBefore?.name_en} → ${monster?.name_en}`;
    if (logType === 'egg') return `hatched 🥚${entry?.eggType}`;
    return '';
  })();
  const tags = (() => {
    if (logType === 'exchange') {
      // const isFever = entry?.is_spmatch;
      const expectedMemento = Math.ceil((entry?.totalStats || 0) / 2);
      const expectedEgg = Math.ceil((entry?.totalStats || 0) / 5);
      const isFever = entry?.get_memento_point > expectedMemento
        || entry?.get_egg_point > expectedEgg;
      return [
        entry?.is_spmatch && '🔥FEVER',
        isFever && '🔥FEVER_CALC',
        !entry?.is_spmatch && !isFever && 'NO_FEVER',
      ];
    }
    return [];
  })().filter((g) => g).map((g) => `<${g}>`).join(' ');
  const resultsStr = (() => {
    if (logType === 'age') return [`P: ${entry?.monsterBefore?.power}`, `S: ${entry?.monsterBefore?.speed}`, `T: ${entry?.monsterBefore?.technic}`];
    if (logType === 'cleaning') return [`💩${entry?.garbageBefore || 0} → 0`];
    if (logType === 'meal') return [`❤️${(entry?.stomach || 0) - 1} → ${entry?.stomach || 0}`];
    if (logType === 'training') return [`+${entry?.up_status}${STAT_ICON[entry?.type]}`];
    if (logType === 'exchange') {
      return [
        entry?.get_memento_point && `+${entry?.get_memento_point} memento`,
        entry?.get_egg_point && `+${entry?.get_egg_point} egg`,
        // entry?.memento_get && 'GOT_MEMENTO',
      ];
    }
    return [];
  })().filter((g) => g).join(', ');
  return `[${dateStr}]${reporting && tags ? ` ${tags}` : ''} ${monster.name_en} ${actionStr}${resultsStr && !reporting ? ` (${resultsStr})` : ''}`;
}

function CareLog({
  title,
  logTypes,
  rows,
  allowClear,
  onlyDiscoveries,
}) {
  const textAreaEl = React.useRef();
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    log,
    allMonsters,
  } = pockestState;
  const careLogData = React.useMemo(
    () => {
      const d = log.filter((entry) => logTypes.includes(entry.logType));
      if (onlyDiscoveries) {
        return d.filter((entry) => entry.logType === 'exchange' && isMatchDiscovery(allMonsters, entry));
      }
      return d;
    },
    [log, logTypes, allMonsters, onlyDiscoveries],
  );
  const careLog = React.useMemo(() => [
    `[Pockest Helper v${window.APP_VERSION}]`,
    ...careLogData.map((entry) => entryTemplate({
      allMonsters,
      entry,
      reporting: onlyDiscoveries,
    })),
  ], [careLogData, allMonsters, onlyDiscoveries]);
  React.useEffect(() => {
    if (!textAreaEl?.current) return () => {};
    textAreaEl.current.scrollTop = textAreaEl.current.scrollHeight;
    return () => {};
  }, [careLog]);
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
          ref={textAreaEl}
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
            onClick={() => navigator.clipboard.writeText([`[${(new Date()).toLocaleString()}] Pockest Helper v${window.APP_VERSION}`, ...careLog].join('\n'))}
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
