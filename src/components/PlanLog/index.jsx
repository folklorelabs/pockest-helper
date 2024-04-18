import React from 'react';
import PropTypes from 'prop-types';
import {
  getCurrentPlanSchedule,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';
import { parseDurationStr } from '../../utils/parseDuration';

function PlanLog({
  title,
  rows,
}) {
  const [isAbsTime, setIsAbsTime] = React.useState(false);
  const textAreaEl = React.useRef();
  const {
    pockestState,
  } = usePockestContext();
  const scheduleLog = React.useMemo(() => {
    const birth = pockestState?.data?.monster?.live_time;
    const { cleanSchedule, feedSchedule } = getCurrentPlanSchedule(pockestState);
    const data = [
      ...cleanSchedule.map((w) => ({
        label: 'Clean',
        ...w,
      })),
      ...feedSchedule.map((w) => ({
        label: `Feed (${Array.from(new Array(w.feedTarget)).map(() => '♥').join('')}${Array.from(new Array(6 - w.feedTarget)).map(() => '♡').join('')}) `,
        ...w,
      })),
    ].sort((a, b) => a.start - b.start).map((d) => ({
      ...d,
      startOffsetLabel: parseDurationStr(d.start - birth),
      startLabel: (new Date(d.start)).toLocaleString(),
    }));
    return [
      `[Pockest Helper v${import.meta.env.APP_VERSION}] Target ${pockestState?.planId} (Age ${pockestState?.planAge})`,
      ...data.map((d) => `[${isAbsTime ? d.startLabel : d.startOffsetLabel}] ${d.label}`),
    ];
  }, [pockestState, isAbsTime]);
  return (
    <div className="PlanLog">
      <header className="PlanLog-header">
        <p className="PlanLog-title">
          {title}
          {' '}
          (
          {scheduleLog?.length || 0}
          )
        </p>
        <label className="PockestCheck" htmlFor="PockestHelper_PlanLogAbsTime">
          <input
            id="PockestHelper_PlanLogAbsTime"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => setIsAbsTime(e.target.checked)}
            checked={isAbsTime}
          />
          <span className="PockestCheck-text">Absolute Time</span>
        </label>
      </header>
      <div className="PlanLog-content">
        <textarea
          ref={textAreaEl}
          className="PlanLog-textarea"
          value={scheduleLog.join('\n')}
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
            onClick={() => navigator.clipboard.writeText(scheduleLog.join('\n'))}
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
