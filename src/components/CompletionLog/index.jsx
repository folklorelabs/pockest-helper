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
  const totalCount = evolvedMonsters.length;
  const acquiredStickerCount = React.useMemo(() => evolvedMonsters
    ?.filter((m) => m?.unlock)
    ?.length, [evolvedMonsters]);
  const stickerCompletion = React.useMemo(() => {
    const curLiveDur = pockestState?.data?.monster?.live_time
      ? (now.getTime() - pockestState.data.monster.live_time) : 0;
    const curCompDur = Math.min(DAY_IN_MS * 3, curLiveDur);
    const completionDur = (totalCount - acquiredStickerCount) * (3 * DAY_IN_MS) - curCompDur;
    const completionDate = new Date(now.getTime() + completionDur);
    return completionDate;
  }, [totalCount, acquiredStickerCount, now, pockestState]);
  const stickerString = React.useMemo(() => {
    const dateStr = isRelTime
      ? parseDurationStr(stickerCompletion - now) : stickerCompletion.toLocaleString();
    const labelStr = `All ${totalCount} Stickers (${totalCount - acquiredStickerCount} left)`;
    return `[${dateStr}] ${labelStr}`;
  }, [isRelTime, totalCount, acquiredStickerCount, now, stickerCompletion]);
  const acquiredMementoCount = React.useMemo(() => evolvedMonsters
    ?.filter((m) => m?.memento_flg)
    ?.length, [evolvedMonsters]);
  const mementoCompletion = React.useMemo(() => {
    const curLiveDur = pockestState?.data?.monster?.live_time
      ? (now.getTime() - pockestState.data.monster.live_time) : 0;
    const curCompDur = Math.min(DAY_IN_MS * 7, curLiveDur);
    const completionDur = (totalCount - acquiredStickerCount) * (7 * DAY_IN_MS) - curCompDur;
    const completionDate = new Date(now.getTime() + completionDur);
    return completionDate;
  }, [totalCount, acquiredStickerCount, now, pockestState]);
  const mementoString = React.useMemo(() => {
    const dateStr = isRelTime
      ? parseDurationStr(mementoCompletion - now) : mementoCompletion.toLocaleString();
    const labelStr = `All ${totalCount} Mementos (${totalCount - acquiredMementoCount} left)`;
    return `[${dateStr}] ${labelStr}`;
  }, [isRelTime, totalCount, acquiredMementoCount, now, mementoCompletion]);
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
