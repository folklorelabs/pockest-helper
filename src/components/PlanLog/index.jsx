import React from 'react';
import PropTypes from 'prop-types';
import {
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import { parseDurationStr } from '../../utils/parseDuration';
import { getCurrentMonsterLogs } from '../../contexts/PockestContext/getters';
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
  const scheduleLog = React.useMemo(() => {
    const birth = pockestState?.data?.monster?.live_time;
    const {
      cleanSchedule,
      feedSchedule,
      trainSchedule,
    } = pockestGetters.getCurrentPlanSchedule(pockestState);
    const matchSchedule = pockestGetters.getMatchSchedule(pockestState);
    let data = [];
    const isDone = (type, scheduleEntry, grace = (1000 * 60 * 60)) => {
      const logs = getCurrentMonsterLogs(pockestState, type);
      return logs.find((l) => l?.timestamp >= scheduleEntry.start
        && l?.timestamp < (scheduleEntry.start + grace));
    };
    const stunOffset = pockestGetters.getPlanStunOffset(pockestState);
    if (typeof stunOffset === 'number') {
      const start = birth + pockestGetters.getPlanStunOffset(pockestState);
      data.push({
        start,
        completion: `${Date.now() >= start ? '☑' : '☐'}`,
        label: 'Stop curing',
      });
    }
    data = [
      ...data,
      ...(cleanSchedule?.map((w) => ({
        completion: `${isDone('cleaning', w) ? '☑' : '☐'}`,
        label: 'Clean',
        ...w,
      })) ?? []),
      ...(feedSchedule?.map((w) => ({
        completion: `${isDone('meal', w) ? '☑' : '☐'}`,
        label: `Feed (${Array.from(new Array(w.feedTarget)).map(() => '♥').join('')}${Array.from(new Array(6 - w.feedTarget)).map(() => '♡').join('')})`,
        ...w,
      })) ?? []),
      ...(trainSchedule?.map((w) => ({
        completion: `${isDone('training', w, 1000 * 60 * 60 * 12) ? '☑' : '☐'}`,
        label: `Train ${w.stat}`,
        ...w,
      })) ?? []),
      ...(matchSchedule?.map((w) => ({
        completion: `${isDone('exchange', w, 1000 * 60 * 60 * 12) ? '☑' : '☐'}`,
        label: 'Match',
        ...w,
      })) ?? []),
    ].sort((a, b) => a.start - b.start).map((d) => ({
      ...d,
      startOffsetLabel: parseDurationStr(d.start - birth),
      startLabel: (new Date(d.start)).toLocaleString(),
    }));
    return [
      `[Pockest Helper v${import.meta.env.APP_VERSION}] Target ${pockestState?.planId} (Age ${pockestState?.planAge})`,
      ...data.map((d) => `${d.completion} [${!isRelTime ? d.startLabel : d.startOffsetLabel}] ${d.label}`),
    ];
  }, [pockestState, isRelTime]);
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
