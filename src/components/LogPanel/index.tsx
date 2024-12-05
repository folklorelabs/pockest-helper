import React, { ReactNode } from 'react';
import cx from 'classnames';
import {
  AppContext,
} from '../../contexts/AppContext';
import './index.css';

interface LogPanelProps {
  children: ReactNode;
}

function LogPanel({ children }: LogPanelProps) {
  const {
    setShowLog,
    logStyle,
  } = React.useContext(AppContext);
  return (
    <div className={cx('LogPanel', `LogPanel--${logStyle}`)}>
      <button
        className="LogPanel-close"
        type="button"
        onClick={() => setShowLog && setShowLog(false)}
      >
        «
      </button>
      {children}
    </div>
  );
}

export default LogPanel;
