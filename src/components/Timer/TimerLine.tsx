import React from 'react';

type TimerLineProps = {
  label: string | React.ReactNode;
  value: string;
};

function TimerLine({ label, value }: TimerLineProps) {
  return (
    <p className="TimerLine">
      <span className="TimerLine-label">{label}</span>
      <span className="TimerLine-value">{value}</span>
    </p>
  );
}

export default TimerLine;
