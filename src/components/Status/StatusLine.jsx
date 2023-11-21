import React from 'react';
import PropTypes from 'prop-types';

function StatusLine({ label, value }) {
  return (
    <p className="StatusLine">
      <span className="StatusLine-label">{label}</span>
      <span className="StatusLine-value">{value}</span>
    </p>
  );
}

StatusLine.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default StatusLine;
