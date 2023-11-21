import React from 'react';
import {
  STAT_ID,
  pockestSettings,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';
import Timer from '../Timer';
import useNextFeed from '../../hooks/useNextFeed';
import useNextClean from '../../hooks/useNextClean';
import monsters from '../../config/monsters';
import {
  getMonsterPlan,
} from '../../utils/getMonsterPlan';

function SimpleControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const {
    data,
    monsterId,
  } = pockestState;
  const nextFeed = useNextFeed();
  const nextClean = useNextClean();
  const monsterPlan = React.useMemo(() => getMonsterPlan(monsterId), [monsterId]);
  if (!data || !data.monster) return '';
  return (
    <div className="SimpleControls">
      <div className="PockestLine">
        <span className="PockestText">Target</span>
        <select
          className="PockestSelect"
          onChange={(e) => {
            pockestDispatch(pockestSettings({ monsterId: e.target.value }));
          }}
          defaultValue={monsterId}
        >
          {monsters.map((mon) => (
            <option key={mon.id} value={mon.id}>
              {mon.name}
            </option>
          ))}
        </select>
      </div>
      <div className="PockestLine">
        <span className="PockestText">Plan</span>
        <span className="PockestText">{monsterPlan ?? '[MISSING]'}</span>
      </div>
      <Timer label="Clean" timestamp={nextClean} />
      <Timer label="Feed" timestamp={nextFeed} />
      <Timer label="Train" timestamp={data?.monster?.training_time} />
      <Timer label="Match" timestamp={data?.monster?.exchange_time} />
      <Timer label={`Age ${data?.monster?.age ? data.monster.age + 1 : 0}`} timestamp={data?.next_big_event_timer} />
    </div>
  );
}

export default SimpleControls;
