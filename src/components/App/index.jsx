import React from 'react';
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
  return (
    <div className="App">
      <Lifecycle />
      <header className="App-header">
        <ModeControls />
        <p className="App-title">Pockest Helper</p>
      </header>
      <Status />
      {autoPlan ? (
        <SimpleControls />
      ) : (
        <Controls />
      )}
      <div className="App-button">
        <PauseBtn />
      </div>
      <p className="App-footer">
        <a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3003515624" target="_blank" rel="noreferrer">Consult the guide</a>
        {' '}
        if you need help.
      </p>
    </div>
  );
}

export default App;
