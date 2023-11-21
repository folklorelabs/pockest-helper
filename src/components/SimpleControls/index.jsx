import React from 'react';
import routes from '../../config/routes';
import plans from '../../config/plans';
import {
  STAT_ID,
  pockestSettings,
  pockestMode,
  usePockestContext,
} from '../../contexts/PockestContext';
import './index.css';
import Timer from '../Timer';
import useNextFeed from '../../hooks/useNextFeed';
import useNextClean from '../../hooks/useNextClean';

const STAT_LETTER = {
  1: 'P',
  2: 'S',
  3: 'T',
};

function SimpleControls() {
  const {
    pockestState,
    pockestDispatch,
  } = usePockestContext();
  const nextFeed = useNextFeed();
  const nextClean = useNextClean();
  const {
    data,
  } = pockestState;
  if (!data || !data.monster) return '';
  return (
    <div className="SimpleControls">
      <Timer label={`Age ${data?.monster?.age}`} timestamp={data?.next_big_event_timer} />
      <div className="SimpleControlsLine">
        <label className="SimpleControlsCheck" htmlFor="PockestHelper_AutoFeed">
          <input
            id="PockestHelper_AutoFeed"
            className="SimpleControlsCheck-input"
            type="checkbox"
            onChange={(e) => pockestDispatch(pockestSettings({
              autoFeed: e.target.checked,
              autoClean: e.target.checked,
              autoTrain: e.target.checked,
            }))}
          />
          <span className="SimpleControlsCheck-text">Auto-Care</span>
        </label>
        <select
          className="SimpleControlsSelect"
          onChange={(e) => {
            const route = e.target.value;
            const routePlan = routes[route.slice(0, 2)][data.monster.age];
            const plan = plans[routePlan];
            const newSettings = {
              stat: route.slice(2, 3),
              feedFrequency: plan.feedFrequency,
              cleanFrequency: plan.cleanFrequency,
            };
            pockestDispatch(pockestSettings(newSettings));
          }}
        >
          {Object.keys(routes).map((k) => Object.keys(STAT_ID).map((s) => (
            <option key={`${k}${STAT_LETTER[s]}`} value={`${k}${STAT_LETTER[s]}`}>
              {`${k}${STAT_LETTER[s]}`}
            </option>
          )))}
        </select>
      </div>
      <Timer label="Next Cleaning" timestamp={nextClean} />
      <Timer label="Next Feeding" timestamp={nextFeed} />
      <Timer label="Next Training" timestamp={data?.monster?.training_time} />
      <Timer label="Next Match" timestamp={data?.monster?.exchange_time} />
      <p className="SimpleControls-footer">
        <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3003515624" target="_blank" rel="noreferrer">Consult the guide</a>
        {' '}
        if you need help.
      </p>
      <button
        className="SimpleControlsButton SimpleControlsButton--side"
        type="button"
        onClick={() => pockestDispatch(pockestMode('advanced'))}
      >
        Auto Care
      </button>
    </div>
  );
}

export default SimpleControls;
