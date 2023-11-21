import React from 'react';
import Lifecycle from './Lifecycle';
import Status from '../Status';
import Controls from '../Controls';
import './index.css';

function App() {
  return (
    <div className="App">
      <Lifecycle />
      <header className="App-header">
        <p className="App-title">Pockest Helper</p>
        <Controls />
        <Status />
      </header>
    </div>
  );
}

export default App;
