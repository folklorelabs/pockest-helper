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
import EggControls from '../EggControls';

function App() {
  const {
    pockestState,
  } = usePockestContext();
  const [minimized, setMinimized] = React.useState(false);
  return (
    <div className={cx('App', { 'App--minimized': minimized })}>
      <Lifecycle />
      <button className="AppMinBtn" type="button" onClick={() => setMinimized(!minimized)}>
        ⧉
      </button>
      <header className="App-header">
        <p className="App-title">Pockest Helper</p>
      </header>
      {!pockestState?.initialized || pockestState?.data ? (
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
    </div>
  );
}

export default App;
