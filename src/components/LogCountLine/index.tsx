import React from 'react';
import { AppContext } from '../../contexts/AppContext';
import { usePockestContext } from '../../contexts/PockestContext';

interface LogCountLineProps {
  title?: string;
  logTypes?: string[];
}

const LogCountLine: React.FC<LogCountLineProps> = ({
  title = 'Log',
  logTypes = [
    'cleaning',
    'meal',
    'training',
    'trainingSkip',
    'exchange',
    'age',
    'evolution',
    'departure',
    'death',
    'hatching',
    'cure',
    'error',
    'evolution_failure',
  ],
}) => {
  const { pockestState } = usePockestContext();
  const { setShowLog } = React.useContext(AppContext);
  const { log } = pockestState;
  return (
    <div className="LogCountLine PockestLine">
      <span className="PockestText">{title}</span>
      <button
        type="button"
        className="PockestText PockestLine-value PockestLink"
        onClick={() => setShowLog && setShowLog(true)}
      >
        {log.filter((entry) => logTypes.includes(entry.logType))?.length ??
          '--'}
      </button>
    </div>
  );
};

export default LogCountLine;
