import React from 'react';
import PropTypes from 'prop-types';
import {
  pockestClearLog,
  usePockestContext,
} from '../../contexts/PockestContext';
import monsters from '../../data/monsters.json';
import './index.css';

const REPORT_TEMPLATES = {
  default: (entry) => {
    const dateStr = (new Date(entry?.timestamp)).toLocaleString();
    const monster = monsters.find((m) => m.monster_id === entry?.monsterId);
    const entryStr = (() => {
      if (entry?.logType === 'clean') return '🧹 Clean';
      if (entry?.logType === 'meal') return '🍎 Feed';
      if (entry?.logType === 'training') return `💪🏼 Train ${entry?.statType} (+${entry?.statDiff})`;
      return '';
    })();
    return `[${dateStr} | ${monster.name_en}] ${entryStr} `;
  },
  match: (entry) => {
    const dateStr = (new Date(entry.timestamp)).toLocaleString();
    const a = monsters.find((m) => m.monster_id === entry.aId);
    const hasFever = entry.mementoDiff > entry.totalStats / 2;
    const expectFever = a.matchFever.includes(entry.bId);
    const b = monsters.find((m) => m.monster_id === entry.bId);
    const emojis = [
      !expectFever && hasFever && '🆕',
      hasFever && '🔥 ',
    ].filter((e) => e).join('');
    return `[${dateStr}] ${emojis}${a.name_en} vs ${b.name_en}`;
  },
};

function CareLog({ title, logTypes }) {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    log,
  } = pockestState;
  const careLogData = React.useMemo(
    () => log.filter((entry) => logTypes.includes(entry.logType)),
    [log, logTypes],
  );
  const careLog = React.useMemo(() => careLogData.map((entry) => {
    const logType = entry?.logType;
    const entryFn = REPORT_TEMPLATES[logType] || REPORT_TEMPLATES.default;
    return entryFn(entry);
  }), [careLogData]);
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
          rows={12}
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
        </div>
      </div>
    </div>
  );
}

CareLog.defaultProps = {
  title: 'Log',
  logTypes: ['clean', 'meal', 'training', 'match'],
};

CareLog.propTypes = {
  title: PropTypes.string,
  logTypes: PropTypes.arrayOf(PropTypes.string),
};

export default CareLog;
