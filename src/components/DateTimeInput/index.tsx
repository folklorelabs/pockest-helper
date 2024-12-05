import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import toLocalIsoString from '../../utils/toLocalIsoString';
import './index.css';

function DateTimeInput({ className, value, onChange }) {
  const [inputVal, setInputVal] = React.useState();
  React.useEffect(() => {
    const date = value ? new Date(value) : null;
    const newInputVal = date ? toLocalIsoString(date).slice(0, 19) : date;
    setInputVal(newInputVal);
  }, [value]);
  return (
    <input
      className={cx('DateTimeInput', 'PockestInput', className)}
      type="datetime-local"
      defaultValue={inputVal}
      onChange={(e) => {
        setInputVal(e.target.value);
        onChange(e);
      }}
    />
  );
}

DateTimeInput.defaultProps = {
  className: '',
  value: null,
  onChange: () => {},
};

DateTimeInput.propTypes = {
  className: PropTypes.string,
  value: PropTypes.number,
  onChange: PropTypes.func,
};

export default DateTimeInput;
