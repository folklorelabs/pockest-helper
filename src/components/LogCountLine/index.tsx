import React from 'react';
import PropTypes from 'prop-types';
import {
  usePockestContext,
} from '../../contexts/PockestContext';
import {
  AppContext,
} from '../../contexts/AppContext';

function LogCountLine({ title, logTypes }) {
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
        onClick={() => {
          setShowLog(true);
        }}
      >
        {log.filter((entry) => logTypes.includes(entry.logType))?.length ?? '--'}
      </button>
    </div>
  );
}

LogCountLine.defaultProps = {
  title: 'Log',
  logTypes: ['cleaning', 'meal', 'training', 'exchange'],
};

LogCountLine.propTypes = {
  title: PropTypes.string,
  logTypes: PropTypes.arrayOf(PropTypes.string),
};

export default LogCountLine;
