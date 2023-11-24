import React from 'react';
import {
  pockestSettings,
  usePockestContext,
  getCurrentPlanScheduleWindows,
  getCurrentPlanStats,
} from '../../contexts/PockestContext';
import './index.css';
import useNow from '../../hooks/useNow';
import { parseDurationStr } from '../../utils/parseDuration';

// CONSTS
const FEED_INTERVAL = {
  4: 'Every 4h',
  12: 'Every 12h',
  24: 'Every 24h',
};

function FeedControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const now = useNow();
  const {
    currentFeedWindow,
    nextFeedWindow,
  } = React.useMemo(() => getCurrentPlanScheduleWindows(pockestState), [pockestState]);
  const {
    feedFrequency,
    feedTarget,
  } = React.useMemo(() => getCurrentPlanStats(pockestState), [pockestState]);

  const {
    data,
    autoPlan,
    autoFeed,
    paused,
  } = pockestState;
  return (
    <div className="FeedControls">
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoFeed">
          <input
            id="PockestHelper_AutoFeed"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoFeed: e.target.checked }))}
            checked={autoFeed || autoPlan}
            disabled={!paused || autoPlan}
          />
          <span className="PockestCheck-text">Feed</span>
        </label>
      </div>
      <div className="PockestLine">
        <span className="PockestText">
          Current
        </span>
        <span className="PockestText">
          <span className="PockestIcon">❤️</span>
          {' '}
          {typeof data?.monster?.stomach === 'number' ? data?.monster?.stomach : '--'}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">
          Next Hunger
        </span>
        <span className="PockestText">
          {parseDurationStr(data?.next_small_event_timer ? data.next_small_event_timer - now.getTime() : '--')}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">
          Next Meal
        </span>
        <span className="PockestText">
          {(() => {
            if (feedFrequency === 4 || !nextFeedWindow) return '--';
            return parseDurationStr(nextFeedWindow.start - now.getTime());
          })()}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">
          Current Meal
        </span>
        <span className="PockestText">
          {(() => {
            if (feedFrequency === 4) return '∞';
            if (!currentFeedWindow) return '--';
            return parseDurationStr(currentFeedWindow.end - now.getTime());
          })()}
        </span>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Meal Frequency</span>
        <select
          className="PockestSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ feedFrequency: parseInt(e.target.value, 10) }));
          }}
          value={feedFrequency}
          disabled={!paused || autoPlan}
        >
          {Object.keys(FEED_INTERVAL).map((k) => (
            <option key={k} value={k}>
              {FEED_INTERVAL[k]}
            </option>
          ))}
        </select>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Meal Plan</span>
        <select
          className="PockestSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ feedTarget: parseInt(e.target.value, 10) }));
          }}
          value={feedTarget}
          disabled={!paused || autoPlan}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <option key={k} value={k}>
              {`❤️ → ${k}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default FeedControls;
