import React from 'react';
import Lifecycle from './Lifecycle';
import Status from '../Status';
import './index.css';
import Controls from '../Controls';
import SimpleControls from '../SimpleControls';
import { usePockestContext } from '../../contexts/PockestContext';

function App() {
  const { pockestState } = usePockestContext();
  const { mode } = pockestState;
  return (
    <div className="App">
      <Lifecycle />
      <header className="App-header">
        <p className="App-title">Pockest Helper</p>
      </header>
      <Status />
      {mode === 'simple' ? (
        <SimpleControls />
      ) : (
        <Controls />
      )}
    </div>
  );
}

export default App;
