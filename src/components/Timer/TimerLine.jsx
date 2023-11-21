import React from 'react';
import PropTypes from 'prop-types';

function TimerLine({ label, value }) {
  return (
    <p className="TimerLine">
      <span className="TimerLine-label">{label}</span>
      <span className="TimerLine-value">{value}</span>
    </p>
  );
}

TimerLine.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default TimerLine;
