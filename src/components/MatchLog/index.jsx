import React from 'react';
import {
  pockestClearLog,
  usePockestContext,
} from '../../contexts/PockestContext';
import monsters from '../../data/monsters.json';
import './index.css';

function MatchLog() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    log,
  } = pockestState;
  const matchReport = React.useMemo(() => log?.match.map((entry) => {
    const dateLabel = (new Date(entry.timestamp)).toLocaleString();
    const a = monsters.find((m) => m.monster_id === entry.aId);
    const hasFever = entry.mementoDiff > entry.totalStats / 2;
    const expectFever = a.matchFever.includes(entry.bId);
    const b = monsters.find((m) => m.monster_id === entry.bId);
    const emojis = [
      !expectFever && hasFever && '🆕',
      hasFever && '🔥',
    ].filter((e) => e).join('');
    return `${emojis}${a.name_en} vs ${b.name_en} (${dateLabel})`;
  }), [log?.match]);
  return (
    <div className="MatchLog">
      <header className="MatchLog-header">
        <p className="MatchLog-title">
          Match Log (
          {log?.match?.length || 0}
          )
        </p>
      </header>
      <div className="MatchLog-content">
        <textarea
          className="MatchLog-textarea"
          value={matchReport.join('\n\n')}
          readOnly
          rows={12}
        />
        <div
          className="MatchLog-buttons"
        >
          <button
            type="button"
            className="PockestLink MatchLog-copy"
            aria-label="Copy report to clipboard"
            onClick={() => navigator.clipboard.writeText(matchReport.join('\n'))}
          >
            📋 Copy
          </button>
          <button
            type="button"
            className="PockestLink MatchLog-clear"
            aria-label="Clear match history"
            onClick={() => {
              const confirm = window.confirm('Are you sure you want to permanently clear your match history?');
              if (!confirm) return;
              pockestDispatch(pockestClearLog('match'));
            }}
          >
            ❌ Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default MatchLog;
