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
  const [isRelTime, setIsRelTime] = React.useState(false);
  const textAreaEl = React.useRef();
  const now = useNow();
  const {
    pockestState,
  } = usePockestContext();
  const curLiveDur = React.useMemo(() => (pockestState?.data?.monster?.live_time
    ? (now - pockestState.data.monster.live_time) : 0), [
    now,
    pockestState?.data?.monster?.live_time,
  ]);
  const evolvedMonsters = React.useMemo(() => pockestState?.allMonsters
    ?.filter((m) => m?.age >= 5), [pockestState?.allMonsters]);
  const totalCount = evolvedMonsters?.length || 0;
  const targetStickerCount = React.useMemo(() => totalCount - (evolvedMonsters
    ?.filter((m) => m?.unlock)
    ?.length || 0), [totalCount, evolvedMonsters]);
  const stickerCompletion = React.useMemo(() => {
    const curCompDur = Math.min(DAY_IN_MS * 3, curLiveDur);
    const completionDur = targetStickerCount * (3 * DAY_IN_MS) - curCompDur;
    const completionDate = now + completionDur;
    return completionDate;
  }, [targetStickerCount, now, curLiveDur]);
  const stickerString = React.useMemo(() => {
    const dateStr = isRelTime
      ? parseDurationStr(stickerCompletion - now) : stickerCompletion.toLocaleString();
    const labelStr = `Stickers Only Completion (${targetStickerCount}/${totalCount} left)`;
    return `[${dateStr}] ${labelStr}`;
  }, [isRelTime, targetStickerCount, now, stickerCompletion, totalCount]);
  const targetMementoCount = React.useMemo(() => totalCount - (evolvedMonsters
    ?.filter((m) => m?.memento_flg)
    ?.length || 0), [totalCount, evolvedMonsters]);
  const mementoCompletion = React.useMemo(() => {
    const curCompDur = Math.min(DAY_IN_MS * 7, curLiveDur);
    const completionDur = targetMementoCount * (7 * DAY_IN_MS) - curCompDur;
    const completionDate = now + completionDur;
    return completionDate;
  }, [curLiveDur, targetMementoCount, now]);
  const mementoString = React.useMemo(() => {
    const dateStr = isRelTime
      ? parseDurationStr(mementoCompletion - now) : mementoCompletion.toLocaleString();
    const labelStr = `Mementos Completion (${targetMementoCount}/${totalCount} left)`;
    return `[${dateStr}] ${labelStr}`;
  }, [isRelTime, targetMementoCount, now, mementoCompletion, totalCount]);
  const timeSpent = React.useMemo(() => {
    const mementosObtained = totalCount - targetMementoCount;
    const stickersObtained = totalCount - targetStickerCount - mementosObtained;
    const obDur = (mementosObtained * 7 * DAY_IN_MS) + (stickersObtained * 3 * DAY_IN_MS)
      + curLiveDur;
    return parseDurationStr(obDur);
  }, [totalCount, targetMementoCount, targetStickerCount, curLiveDur]);
  const log = [
    `${title} (uptime ≈ ${timeSpent})`,
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
          className="PockestTextArea CompletionLog-textarea"
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
  rows: 4,
};

CompletionLog.propTypes = {
  title: PropTypes.string,
  rows: PropTypes.number,
};

export default CompletionLog;
