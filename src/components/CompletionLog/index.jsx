import React from 'react';
import PropTypes from 'prop-types';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import { parseDurationStr } from '../../utils/parseDuration';
import useNow from '../../hooks/useNow';
import './index.css';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

function CompletionLog({
  title,
  rows,
}) {
  const [isRelTime, setIsRelTime] = React.useState(true);
  const textAreaEl = React.useRef();
  const now = useNow();
  const {
    pockestState,
  } = usePockestContext();
  const evolvedMonsters = React.useMemo(() => pockestState?.allMonsters
    ?.filter((m) => m?.age >= 5), [pockestState?.allMonsters]);
  const totalCount = evolvedMonsters?.length || 0;
  const targetStickerCount = React.useMemo(() => totalCount - (evolvedMonsters
    ?.filter((m) => m?.unlock)
    ?.length || 0), [totalCount, evolvedMonsters]);
  const stickerString = React.useMemo(() => {
    const curLiveDur = pockestState?.data?.monster?.live_time
      ? (now.getTime() - pockestState.data.monster.live_time) : 0;
    const curCompDur = Math.min(DAY_IN_MS * 3, curLiveDur);
    const completionDur = targetStickerCount * (3 * DAY_IN_MS) - curCompDur;
    const completionDate = new Date(now.getTime() + completionDur);
    const dateStr = isRelTime
      ? parseDurationStr(completionDate - now) : completionDate.toLocaleString();
    const labelStr = `All ${totalCount} Stickers (${targetStickerCount} left)`;
    return `[${dateStr}] ${labelStr}`;
  }, [pockestState.data.monster.live_time, now, targetStickerCount, isRelTime, totalCount]);
  const targetMementoCount = React.useMemo(() => totalCount - (evolvedMonsters
    ?.filter((m) => m?.memento_flg)
    ?.length || 0), [totalCount, evolvedMonsters]);
  const mementoString = React.useMemo(() => {
    const curLiveDur = pockestState?.data?.monster?.live_time
      ? (now.getTime() - pockestState.data.monster.live_time) : 0;
    const curCompDur = Math.min(DAY_IN_MS * 7, curLiveDur);
    const completionDur = targetMementoCount * (7 * DAY_IN_MS) - curCompDur;
    const completionDate = new Date(now.getTime() + completionDur);
    const dateStr = isRelTime
      ? parseDurationStr(completionDate - now) : completionDate.toLocaleString();
    const labelStr = `All ${totalCount} Mementos (${targetMementoCount} left)`;
    return `[${dateStr}] ${labelStr}`;
  }, [pockestState.data.monster.live_time, now, targetMementoCount, isRelTime, totalCount]);
  const log = [
    stickerString,
    mementoString,
  ];
  return (
    <div className="CompletionLog">
      <header className="CompletionLog-header">
        <p className="CompletionLog-title">
          {title}
        </p>
        <label className="PockestCheck" htmlFor={`PockestHelper_CompletionLogAbsTime--${title.replace(' ', '')}`}>
          <input
            id={`PockestHelper_CompletionLogAbsTime--${title.replace(' ', '')}`}
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => setIsRelTime(e.target.checked)}
            checked={isRelTime}
          />
          <span className="PockestCheck-text">Relative Time</span>
        </label>
      </header>
      <div className="CompletionLog-content">
        <textarea
          ref={textAreaEl}
          className="CompletionLog-textarea"
          value={log.join('\n')}
          readOnly
          rows={rows}
        />
        <div
          className="CompletionLog-buttons"
        >
          <button
            type="button"
            className="PockestLink CompletionLog-copy"
            aria-label={`Copy ${title.toLowerCase()} to clipboard`}
            onClick={() => navigator.clipboard.writeText(log.join('\n'))}
          >
            📋 Copy
          </button>
        </div>
      </div>
    </div>
  );
}

CompletionLog.defaultProps = {
  title: 'Completion Stats',
  rows: 2,
};

CompletionLog.propTypes = {
  title: PropTypes.string,
  rows: PropTypes.number,
};

export default CompletionLog;
