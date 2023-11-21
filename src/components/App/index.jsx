import React from 'react';
import Lifecycle from './Lifecycle';
import Status from '../Status';
import Timers from '../Timers';
import Controls from '../Controls';
import './index.css';

function App() {
  return (
    <div className="App">
      <Lifecycle />
      <header className="App-header">
        <p className="App-title">Pockest Helper</p>
        <Status />
        <Timers />
        <Controls />
      </header>
    </div>
  );
}

export default App;
