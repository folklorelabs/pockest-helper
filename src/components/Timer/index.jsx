import React from 'react';
import PropTypes from 'prop-types';
import { parseDurationStr } from '../../utils/parseDuration';
import TimerLine from './TimerLine';
import './index.css';
import useNow from '../../hooks/useNow';

function Timer({ label, timestamp }) {
  const now = useNow();
  const date = new Date(timestamp);
  return (
    <TimerLine label={label} value={timestamp ? parseDurationStr(date - now) : '--'} />
  );
}

Timer.defaultProps = {
  timestamp: null,
};

Timer.propTypes = {
  label: PropTypes.string.isRequired,
  timestamp: PropTypes.number,
};

export default Timer;
