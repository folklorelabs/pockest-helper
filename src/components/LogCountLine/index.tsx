import React from 'react';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import {
  AppContext,
} from '../../contexts/AppContext';

interface LogCountLineProps {
  title?: string;
  logTypes?: string[];
}

const LogCountLine: React.FC<LogCountLineProps> = ({ title = 'Log', logTypes = ['cleaning', 'meal', 'training', 'exchange'] }) => {
  const {
    pockestState,
  } = usePockestContext();
  const { setShowLog } = React.useContext(AppContext);
  const {
    log,
  } = pockestState;
  return (
    <div className="LogCountLine PockestLine">
      <span className="PockestText">
        {title}
      </span>
      <button
        type="button"
        className="PockestText PockestLine-value PockestLink"
        onClick={() => setShowLog && setShowLog(true)}
      >
        {log.filter((entry) => logTypes.includes(entry.logType))?.length ?? '--'}
      </button>
    </div>
  );
};

export default LogCountLine;
