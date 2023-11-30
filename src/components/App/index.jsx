import React from 'react';
import cx from 'classnames';
import Lifecycle from './Lifecycle';
import './index.css';
import PauseBtn from '../PauseBtn';
import AutoPlanControls from '../AutoPlanControls';
import CleanControls from '../CleanControls';
import FeedControls from '../FeedControls';
import MatchControls from '../MatchControls';
import TrainControls from '../TrainControls';
import BuyEggBtn from '../BuyEggBtn';
import { usePockestContext } from '../../contexts/PockestContext';
import { useAppContext } from '../../contexts/AppContext';
import EggControls from '../EggControls';
import LogPanel from '../LogPanel';
import CareLog from '../CareLog';
import CureControls from '../CureControls';
import CharacterSprite from '../CharacterSprite';

function App() {
  const {
    pockestState,
  } = usePockestContext();
  const {
    showLog,
  } = useAppContext();
  const [minimized, setMinimized] = React.useState(false);
  const [lol, setLol] = React.useState(false);
  return (
    <div className={cx('App', { 'App--minimized': minimized })}>
      <Lifecycle />
      <button className="AppMinBtn" type="button" onClick={() => setMinimized(!minimized)}>
        ⧉
      </button>
      <header className="App-header">
        <p className="App-title">Pockest Helper</p>
      </header>
      {!pockestState?.initialized || pockestState?.data?.monster ? (
        <>
          <AutoPlanControls />
          <hr />
          <CleanControls />
          <hr />
          <FeedControls />
          <hr />
          <TrainControls />
          <hr />
          <MatchControls />
          <hr />
          <CureControls />
          <div className="App-button">
            <PauseBtn />
          </div>
          <p className="App-footer">
            *These timers are shared and track the soonest poop OR hunger.
          </p>
        </>
      ) : (
        <>
          <EggControls />
          <div className="App-button">
            <BuyEggBtn />
          </div>
        </>
      )}
      {showLog ? (
        <LogPanel>
          <CareLog title="Care Log" rows={36} />
          <CareLog title="Newly Discovered Fever Matches" logTypes={['exchange']} onlyDiscoveries allowClear={false} />
        </LogPanel>
      ) : ''}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <button type="button" tabIndex="-1" className="App-sprite" onClick={() => setLol(!lol)}>
        {lol ? (
          <CharacterSprite
            action={pockestState?.paused ? 'down' : 'idle'}
          />
        ) : ''}
      </button>
    </div>
  );
}

export default App;
