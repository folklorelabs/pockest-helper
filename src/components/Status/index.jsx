import React from 'react';
import { usePockestContext } from '../../contexts/PockestContext';
import './index.css';

function Status() {
  const { pockestState } = usePockestContext();
  const { data } = pockestState;

  return (
    <div className="Status">
      <span className="Status-item">
        Age
        {' '}
        {data?.monster?.age}
      </span>
      <span className="Status-item">
        ❤️
        {' '}
        {data?.monster?.stomach}
      </span>
      <span className="Status-item">
        💩
        {' '}
        {data?.monster?.garbage}
      </span>
    </div>
  );
}

export default Status;
