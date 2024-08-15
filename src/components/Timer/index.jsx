import React from 'react';
import PropTypes from 'prop-types';
import { parseDurationStr } from '../../utils/parseDuration';
import TimerLine from './TimerLine';
import useNow from '../../hooks/useNow';
import './index.css';

function Timer({ label, timestamp, value }) {
  const now = useNow();
  const v = (() => {
    if (value) return value;
    if (timestamp) return parseDurationStr(timestamp - now);
    return '--';
  })();
  return (
    <TimerLine label={label} value={v} />
  );
}

Timer.defaultProps = {
  timestamp: null,
  value: null,
};

Timer.propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]).isRequired,
  timestamp: PropTypes.number,
  value: PropTypes.string,
};

export default Timer;
