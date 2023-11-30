import React from 'react';
import PropTypes from 'prop-types';
import {
  pockestClearLog,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';
import isMatchDiscovery from '../../utils/isMatchDiscovery';
import getActionResultString from '../../utils/getActionResultString';

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
  } = pockestState;
  const careLogData = React.useMemo(
    () => {
      const d = log.filter((entry) => logTypes.includes(entry.logType));
      if (onlyDiscoveries) {
        return d.filter((entry) => entry.logType === 'exchange' && isMatchDiscovery(pockestState, entry));
      }
      return d;
    },
    [log, onlyDiscoveries, logTypes, pockestState],
  );
  console.log(log);
  const careLog = React.useMemo(() => [
    `[Pockest Helper v${import.meta.env.APP_VERSION}]`,
    ...careLogData.map((entry) => getActionResultString({
      pockestState,
      result: entry,
      reporting: onlyDiscoveries,
    })),
  ], [careLogData, pockestState, onlyDiscoveries]);
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
            onClick={() => navigator.clipboard.writeText([`[${(new Date()).toLocaleString()}] Pockest Helper v${import.meta.env.APP_VERSION}`, ...careLog].join('\n'))}
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
  logTypes: ['cleaning', 'meal', 'training', 'exchange', 'age', 'hatching', 'cure'],
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
