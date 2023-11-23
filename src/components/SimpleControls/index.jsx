import React from 'react';
import {
  getCurrentPlan,
  getCurrentPlanScheduleWindows,
  getCurrentPlanTimes,
  usePockestContext,
} from '../../contexts/PockestContext';
import TargetMonsterSelect from '../TargetMonsterSelect';
import './index.css';
import Timer from '../Timer';
import {
  getMonsterPlan,
} from '../../utils/getMonsterPlan';

function SimpleControls() {
  const {
    pockestState,
  } = usePockestContext();
  const {
    data,
    monsterId,
  } = pockestState;
  const {
    currentCleanWindow,
    nextCleanWindow,
    currentFeedWindow,
    nextFeedWindow,
  } = React.useMemo(() => getCurrentPlanScheduleWindows(pockestState), [pockestState]);
  const {
    cleanFrequency,
    feedFrequency,
  } = React.useMemo(() => getCurrentPlan(pockestState), [pockestState]);
  const monsterPlan = React.useMemo(() => getMonsterPlan(monsterId), [monsterId]);
  if (!data || !data.monster) return '';

  const cleanEventTime = (() => {
    if (cleanFrequency === 2) return null;
    if (currentCleanWindow) return currentCleanWindow.end;
    return nextCleanWindow.start;
  })();
  const feedEventTime = (() => {
    if (feedFrequency === 4) return null;
    if (currentFeedWindow) return currentFeedWindow.end;
    return nextFeedWindow.start;
  })();
  return (
    <div className="SimpleControls">
      <div className="PockestLine">
        <span className="PockestText">Target</span>
        <TargetMonsterSelect />
      </div>
      <div className="PockestLine">
        <span className="PockestText">Plan</span>
        <span className="PockestText">{monsterPlan ?? '--'}</span>
      </div>
      <Timer
        label={currentCleanWindow || cleanFrequency === 2 ? 'Cleaning' : 'Clean'}
        timestamp={cleanEventTime}
        value={cleanFrequency === 2 ? '∞' : null}
      />
      <Timer
        label={currentFeedWindow || feedFrequency === 4 ? 'Feeding' : 'Feed'}
        timestamp={feedEventTime}
        value={feedFrequency === 4 ? '∞' : null}
      />
      <Timer label="Train" timestamp={data?.monster?.training_time} />
      <Timer label="Match" timestamp={data?.monster?.exchange_time} />
      <Timer label={`Age ${data?.monster?.age ? data.monster.age + 1 : 0}`} timestamp={data?.next_big_event_timer} />
    </div>
  );
}

export default SimpleControls;
