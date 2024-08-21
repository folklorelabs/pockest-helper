import React from 'react';
import PropTypes from 'prop-types';
import {
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import { parseDurationStr } from '../../utils/parseDuration';
import APP_NAME from '../../config/APP_NAME';
import prettyTimeStamp from '../../utils/prettyTimestamp';
import './index.css';

function PlanLog({
  title,
  rows,
}) {
  const [isRelTime, setIsRelTime] = React.useState(false);
  const textAreaEl = React.useRef();
  const {
    pockestState,
  } = usePockestContext();
  const schedule = React.useMemo(() => pockestGetters.getPlanLog(pockestState), [pockestState]);
  const scheduleLog = React.useMemo(() => [
    `[${APP_NAME}] Target ${pockestState?.planId} (Age ${pockestState?.planAge})`,
    ...schedule.map((d) => {
      const icon = (() => {
        if (d.completion) return '☑';
        if (Date.now() >= (d.start + d.logGrace)) return '⚠';
        return '☐';
      })();
      return `${icon} [${!isRelTime ? prettyTimeStamp(d.start) : parseDurationStr(d.startOffset)}] ${d.label}`;
    }),
  ].filter((l) => l).join('\n'), [isRelTime, pockestState?.planAge, pockestState?.planId, schedule]);
  React.useEffect(() => {
    if (!textAreaEl?.current) return () => {};
    const lineHeight = textAreaEl.current.scrollHeight / (schedule.length + 1);
    const lastSuccessIndex = schedule?.reduce(
      (latestIndex, item, itemIndex) => (item?.completion ? itemIndex : latestIndex),
      0,
    );
    const fromTop = Math.max(0, lineHeight * (lastSuccessIndex - rows / 2 + 1));
    textAreaEl.current.scrollTop = fromTop;
    return () => {};
  }, [rows, schedule]);
  return (
    <div className="PlanLog">
      <header className="PlanLog-header">
        <p className="PlanLog-title">
          {title}
          {' '}
          (
          {schedule?.length || 0}
          )
        </p>
        <label className="PockestCheck" htmlFor={`PockestHelper_PlanLogAbsTime--${title.replace(' ', '')}`}>
          <input
            id={`PockestHelper_PlanLogAbsTime--${title.replace(' ', '')}`}
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => setIsRelTime(e.target.checked)}
            checked={isRelTime}
          />
          <span className="PockestCheck-text">Relative Time</span>
        </label>
      </header>
      <div className="PlanLog-content">
        <textarea
          ref={textAreaEl}
          className="PockestTextArea PlanLog-textarea"
          value={scheduleLog}
          readOnly
          rows={rows}
        />
        <div
          className="PlanLog-buttons"
        >
          <button
            type="button"
            className="PockestLink PlanLog-copy"
            aria-label={`Copy ${title.toLowerCase()} to clipboard`}
            onClick={() => navigator.clipboard.writeText(scheduleLog)}
          >
            📋 Copy
          </button>
        </div>
      </div>
    </div>
  );
}

PlanLog.defaultProps = {
  title: 'Log',
  rows: 12,
};

PlanLog.propTypes = {
  title: PropTypes.string,
  rows: PropTypes.number,
};

export default PlanLog;
