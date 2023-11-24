import React from 'react';
import cx from 'classnames';
import Lifecycle from './Lifecycle';
import './index.css';
import SimpleControls from '../SimpleControls';
import PauseBtn from '../PauseBtn';
import AutoPlanControls from '../AutoPlanControls';
import CleanControls from '../CleanControls';
import FeedControls from '../FeedControls';
import MatchControls from '../MatchControls';
import TrainControls from '../TrainControls';

function App() {
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
      <hr />
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
      <div className="App-button">
        <PauseBtn />
      </div>
      <p className="App-footer">
        Consult the
        {' '}
        <a href="https://github.com/folklorelabs/pockest-helper/#readme" target="_blank" rel="noreferrer">README</a>
        {' '}
        if you need help.
      </p>
    </div>
  );
}

export default App;
