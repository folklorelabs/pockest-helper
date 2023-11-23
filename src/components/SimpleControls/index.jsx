import React from 'react';
import {
  getCurrentPlanStats,
  getCurrentPlanScheduleWindows,
  usePockestContext,
  pockestSettings,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import './index.css';
import Timer from '../Timer';
import getMonsterPlan from '../../utils/getMonsterPlan';
import { parseDurationStr } from '../../utils/parseDuration';
import useNow from '../../hooks/useNow';

function SimpleControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const now = useNow();
  const {
    data,
    monsterId,
    autoMatch,
    paused,
  } = pockestState;
  const {
    currentCleanWindow,
    nextCleanWindow,
    currentFeedWindow,
    nextFeedWindow,
  } = React.useMemo(() => getCurrentPlanScheduleWindows(pockestState), [pockestState]);
  const targetPlan = React.useMemo(() => getMonsterPlan(monsterId), [monsterId]);
  const {
    cleanFrequency,
    feedFrequency,
    feedTarget,
  } = React.useMemo(() => getCurrentPlanStats(pockestState), [pockestState]);
  const cleanEventTime = (() => {
    if (cleanFrequency === 2) return null;
    if (currentCleanWindow) return currentCleanWindow.end;
    return nextCleanWindow?.start;
  })();
  const feedEventTime = (() => {
    if (feedFrequency === 4) return null;
    if (currentFeedWindow) return currentFeedWindow.end;
    return nextFeedWindow?.start;
  })();
  return (
    <div className="SimpleControls">
      <div className="PockestLine">
        <span className="PockestText">Target</span>
        <TargetMonsterSelect />
      </div>
      <div className="PockestLine">
        <span className="PockestText">Plan</span>
        <span className="PockestText">{targetPlan.planId ?? '--'}</span>
      </div>
      <Timer
        label={currentCleanWindow || cleanFrequency === 2 ? 'Cleaning' : 'Clean'}
        timestamp={cleanEventTime}
        value={cleanFrequency === 2 ? '∞' : null}
      />
      <Timer
        label={currentFeedWindow || feedFrequency === 4 ? `Feeding (${feedTarget} max)` : 'Feed'}
        timestamp={feedEventTime}
        value={feedFrequency === 4 ? '∞' : null}
      />
      <Timer label="Train" timestamp={data?.monster?.training_time} />
      <div className="PockestLine">
        <label className="PockestCheck" htmlFor="PockestHelper_AutoMatch2">
          <input
            id="PockestHelper_AutoMatch2"
            className="PockestCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({ autoMatch: e.target.checked }))}
            defaultChecked={autoMatch}
            disabled={!paused}
          />
          <span className="PockestCheck-text">Match</span>
        </label>
        <span className="PockestText">
          {parseDurationStr(data?.monster?.exchange_time ? data.monster.exchange_time - now.getTime() : '--')}
        </span>
      </div>
      <Timer label="Poop/Hunger" timestamp={data?.next_small_event_timer} />
      <Timer label={`Age ${data?.monster?.age ? data.monster.age + 1 : 0}`} timestamp={data?.next_big_event_timer} />
    </div>
  );
}

export default SimpleControls;
