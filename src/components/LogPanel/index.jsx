import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import {
  useAppContext,
} from '../../contexts/AppContext';
import './index.css';

function LogPanel({ children }) {
  const {
    setShowLog,
    logStyle,
  } = useAppContext();
  return (
    <div className={cx('LogPanel', `LogPanel--${logStyle}`)}>
      <button
        className="LogPanel-close"
        type="button"
        onClick={() => setShowLog(false)}
      >
        «
      </button>
      {children}
    </div>
  );
}

LogPanel.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default LogPanel;
