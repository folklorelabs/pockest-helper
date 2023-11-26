import React from 'react';
import PropTypes from 'prop-types';
import {
  useAppContext,
} from '../../contexts/AppContext';
import './index.css';

function LogPanel({ children }) {
  const { setShowLog } = useAppContext();
  return (
    <div className="LogPanel">
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
