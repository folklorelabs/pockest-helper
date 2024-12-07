import React from 'react';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import getActionResultString from '../../utils/getActionResultString';
import getMatchReportString from '../../utils/getMatchReportString';
import APP_NAME from '../../constants/APP_NAME';
import './index.css';

interface CareLogProps {
  title?: string;
  logTypes?: string[];
  rows?: number;
  allowClear?: boolean;
  onlyDiscoveries?: boolean;
}

const CareLog: React.FC<CareLogProps> = ({
  title = 'Log',
  logTypes = ['cleaning', 'meal', 'training', 'exchange', 'age', 'evolution', 'departure', 'death', 'hatching', 'cure', 'error', 'evolution_failure'],
  rows = 12,
  allowClear = true,
  onlyDiscoveries = false,
}) => {
  const [isRelTime, setIsRelTime] = React.useState(false);
  const textAreaEl = React.useRef<HTMLTextAreaElement>(null);
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
        return d.filter((entry) => entry.logType === 'exchange' && pockestGetters.isMatchDiscovery(pockestState, entry));
      }
      return d;
    },
    [log, onlyDiscoveries, logTypes, pockestState],
  );
  const careLog = React.useMemo(() => [
    `[${APP_NAME}]`,
    ...careLogData.map((entry) => (onlyDiscoveries ? getMatchReportString : getActionResultString)({
      pockestState,
      result: entry,
      isRelTime,
    })),
  ], [careLogData, isRelTime, onlyDiscoveries, pockestState]);
  React.useEffect(() => {
    if (!textAreaEl?.current) return () => { };
    textAreaEl.current.scrollTop = textAreaEl.current.scrollHeight;
    return () => { };
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
        {!onlyDiscoveries ? (
          <label className="PockestCheck" htmlFor={`PockestHelper_CareLogAbsTime--${title.replace(' ', '')}`}>
            <input
              id={`PockestHelper_CareLogAbsTime--${title.replace(' ', '')}`}
              className="PockestCheck-input"
              type="checkbox"
              onChange={(e) => setIsRelTime(e.target.checked)}
              checked={isRelTime}
            />
            <span className="PockestCheck-text">Relative Time</span>
          </label>
        ) : ''}
      </header>
      <div className="CareLog-content">
        <textarea
          ref={textAreaEl}
          className="PockestTextArea CareLog-textarea"
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
                const confirm = window.confirm(`Are you sure you want to permanently delete your old ${title.toLowerCase()} entries? This will include all entries before your last egg hatch.`);
                if (!confirm) return;
                if (pockestDispatch) pockestDispatch(pockestActions.pockestClearLog(pockestState, logTypes));
              }}
            >
              ❌ Clean
            </button>
          ) : ''}
        </div>
      </div>
    </div>
  );
}

export default CareLog;
