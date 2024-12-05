import React from 'react';
import cx from 'classnames';
import toLocalIsoString from '../../utils/toLocalIsoString';
import './index.css';

interface DateTimeInputProps {
  className?: string;
  value?: number | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function DateTimeInput({ className = '', value = null, onChange = () => { } }: DateTimeInputProps) {
  const [inputVal, setInputVal] = React.useState<string | null>();
  React.useEffect(() => {
    const date = value ? new Date(value) : null;
    const newInputVal = date ? (toLocalIsoString(date) || '').slice(0, 19) : date;
    setInputVal(newInputVal);
  }, [value]);
  return (
    <input
      className={cx('DateTimeInput', 'PockestInput', className)}
      type="datetime-local"
      defaultValue={inputVal || ''}
      onChange={(e) => {
        setInputVal(e.target.value);
        onChange(e);
      }}
    />
  );
}

export default DateTimeInput;
