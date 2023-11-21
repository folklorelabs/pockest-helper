import React from 'react';
import Lifecycle from './Lifecycle';
import Status from '../Status';
import './index.css';
import Controls from '../Controls';

function App() {
  return (
    <div className="App">
      <Lifecycle />
      <header className="App-header">
        <p className="App-title">Pockest Helper</p>
        <Status />
        <Controls />
      </header>
    </div>
  );
}

export default App;
