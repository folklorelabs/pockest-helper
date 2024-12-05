import React from 'react';
import cx from 'classnames';
import { pockestActions, usePockestContext } from '../../contexts/PockestContext';
import './index.css';

function SimpleModeToggle() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();

  return (
    <button
      className="SimpleModeToggle"
      title={!pockestState.simpleMode ? 'Switch to Simple Mode' : 'Switch to Advanced Mode'}
      aria-label={!pockestState.simpleMode ? 'Switch to Simple Mode' : 'Switch to Advanced Mode'}
      type="button"
      onClick={() => pockestDispatch(pockestActions.pockestPlanSettings(pockestState, {
        simpleMode: !pockestState.simpleMode,
      }))}
    >
      <span
        className={cx(
          'SimpleModeToggleText',
          {
            'SimpleModeToggleText--active': pockestState.simpleMode,
          },
        )}
      >
        Simple Mode
      </span>
      {pockestState.simpleMode ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 9C6.372 9 5 10.372 5 12C5 13.628 6.372 15 8 15C9.628 15 11 13.628 11 12C11 10.372 9.628 9 8 9Z" fill="#d5a613" />
          <path d="M16 6H8C4.7 6 2.011 8.689 2 12V12.016C2.009 15.316 4.699 18 8 18H16C19.303 18 21.995 15.312 22 12.006C22 12.004 22 12.002 22 12C21.991 8.691 19.301 6 16 6ZM16 16H8C5.798 16 4.004 14.208 4 12.01C4.004 9.799 5.798 8 8 8H16C18.202 8 19.996 9.799 20 12.006C19.996 14.208 18.202 16 16 16ZM20 12.016L20.443 12.012L21 12.016H20Z" fill="#d5a613" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 9C14.372 9 13 10.372 13 12C13 13.628 14.372 15 16 15C17.628 15 19 13.628 19 12C19 10.372 17.628 9 16 9Z" fill="#d5a613" />
          <path d="M16 6H8C4.704 6 2.018 8.682 2 11.986C2 11.991 2 11.995 2 12V12.016C2 12.02 2 12.024 2 12.028C2.015 15.322 4.703 18 8 18H16C19.309 18 22 15.309 22 12C22 8.691 19.309 6 16 6ZM16 16H8C5.798 16 4.004 14.208 4 12.01C4.004 9.799 5.798 8 8 8H16C18.206 8 20 9.794 20 12C20 14.206 18.206 16 16 16Z" fill="#d5a613" />
        </svg>
      )}
      <span
        className={cx(
          'SimpleModeToggleText',
          {
            'SimpleModeToggleText--active': !pockestState.simpleMode,
          },
        )}
      >
        Advanced Mode
      </span>
    </button>
  );
}

export default SimpleModeToggle;
