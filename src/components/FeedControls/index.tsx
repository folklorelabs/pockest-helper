import React from 'react';
import {
  pockestActions,
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import useNow from '../../hooks/useNow';
import getAgeTimer from '../../utils/getAgeTimer';
import getStomachTimer from '../../utils/getStomachTimer';
import { parseDurationStr } from '../../utils/parseDuration';
import LogCountLine from '../LogCountLine';
import './index.css';

// CONSTS
const FEED_INTERVAL: Record<number, string> = {
  4: 'Every 4h',
  12: 'Every 12h',
  24: 'Every 24h',
  36: 'Every 36h',
};

function FeedControls() {
  const { pockestState, pockestDispatch } = usePockestContext();
  const now = useNow();
  const { currentFeedWindow, nextFeedWindow } = React.useMemo(
    () => pockestGetters.getCurrentPlanScheduleWindows(pockestState),
    [
      pockestState,
    ],
  );
  const ageTimer = React.useMemo(
    () => getAgeTimer(pockestState),
    [
      pockestState,
    ],
  );
  const stomachTimer = React.useMemo(() => {
    const timer = getStomachTimer(pockestState);
    if (
      typeof timer !== 'number' ||
      typeof ageTimer !== 'number' ||
      typeof pockestState?.data?.monster?.age !== 'number'
    )
      return null;
    return timer > ageTimer && pockestState?.data?.monster?.age >= 5
      ? null
      : timer;
  }, [
    pockestState,
    ageTimer,
  ]);

  const { data, autoPlan, autoFeed, paused, feedFrequency, feedTarget } =
    pockestState;
  return (
    <div className="FeedControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoFeed">
          <input
            id="PockestHelper_AutoFeed"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) =>
              pockestDispatch &&
              pockestDispatch(
                pockestActions.pockestSettings({
                  autoFeed: e.target.checked,
                }),
              )
            }
            checked={autoFeed}
            disabled={!paused || autoPlan}
          />
          <span className="PockestCheck-text">Feed</span>
        </label>
        <span className="PockestText">
          <span className="PockestIcon">❤️</span>{' '}
          {typeof data?.monster?.stomach === 'number'
            ? `${data?.monster?.stomach}/6`
            : '--'}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Next Hunger</span>
        <span className="PockestText PockestLine-value">
          {stomachTimer ? parseDurationStr(stomachTimer - now) : '--'}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Meal Frequency</span>
        <select
          className="PockestSelect"
          onChange={(e) =>
            pockestDispatch &&
            pockestDispatch(
              pockestActions.pockestSettings({
                feedFrequency: parseInt(e.target.value, 10),
              }),
            )
          }
          value={feedFrequency}
          disabled={!paused || autoPlan}
        >
          {Object.keys(FEED_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {FEED_INTERVAL[parseInt(k, 10)]}
            </option>
          ))}
        </select>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Meal Target</span>
        <select
          className="PockestSelect"
          onChange={(e) =>
            pockestDispatch &&
            pockestDispatch(
              pockestActions.pockestSettings({
                feedTarget: parseInt(e.target.value, 10),
              }),
            )
          }
          value={feedTarget}
          disabled={!paused || autoPlan}
        >
          {[
            1,
            2,
            3,
            4,
            5,
            6,
          ].map((k) => (
            <option key={k} value={k}>
              {`❤️ ${k}/6`}
            </option>
          ))}
        </select>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Next Meal</span>
        <span className="PockestText PockestLine-value">
          {(() => {
            if (feedFrequency === 4 || !nextFeedWindow) return '--';
            return parseDurationStr(nextFeedWindow.start - now);
          })()}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Current Meal</span>
        <span className="PockestText PockestLine-value">
          {(() => {
            if (feedFrequency === 4) return '∞';
            if (!currentFeedWindow) return '--';
            return parseDurationStr(currentFeedWindow.end - now);
          })()}
        </span>
      </div>
      <LogCountLine
        title="Meals"
        logTypes={[
          'meal',
        ]}
      />
    </div>
  );
}

export default FeedControls;
