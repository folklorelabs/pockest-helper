import React from 'react';
import cx from 'classnames';
import Lifecycle from './Lifecycle';
import Status from '../Status';
import './index.css';
import ModeControls from '../ModeControls';
import Controls from '../Controls';
import SimpleControls from '../SimpleControls';
import { usePockestContext } from '../../contexts/PockestContext';
import PauseBtn from '../PauseBtn';

function App() {
  const { pockestState } = usePockestContext();
  const { autoPlan } = pockestState;
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
      <Status />
      <ModeControls />
      {autoPlan ? (
        <SimpleControls />
      ) : (
        <Controls />
      )}
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
