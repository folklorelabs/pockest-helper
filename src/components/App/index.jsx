import React from 'react';
import cx from 'classnames';
import { usePockestContext } from '../../contexts/PockestContext';
import { useAppContext } from '../../contexts/AppContext';
import LogPanel from '../LogPanel';
import CareLog from '../CareLog';
import CharacterSprite from '../CharacterSprite';
import PlanLog from '../PlanLog';
import CompletionLog from '../CompletionLog';
import './index.css';
import AppMain from './AppMain';

function App() {
  const {
    pockestState,
  } = usePockestContext();
  const {
    showLog,
  } = useAppContext();
  const [minimized, setMinimized] = React.useState(false);
  const [lol, setLol] = React.useState(true);
  return (
    <div className={cx('App', { 'App--minimized': minimized })}>
      <button className="AppMinBtn" type="button" onClick={() => setMinimized(!minimized)}>
        ⧉
      </button>
      <header className="App-header">
        <p className="App-title">Pockest Helper</p>
      </header>
      <AppMain />
      <button type="button" tabIndex="-1" className="App-sprite" onClick={() => setLol(!lol)}>
        {lol ? (
          <CharacterSprite
            action={pockestState?.paused ? 'down' : 'idle'}
            animated={!pockestState?.paused}
            randomAnimations={pockestState?.paused ? null : ['idle', 'win', 'attack']}
            randomAnimationWeights={[100, 10, 60]}
          />
        ) : ''}
      </button>
      {(showLog && !minimized) ? (
        <LogPanel>
          <CareLog title="Care Log" rows={22} />
          <CareLog title="Newly Discovered Fever Matches" logTypes={['exchange']} onlyDiscoveries allowClear={false} rows={3} />
          {pockestState?.autoPlan ? (<PlanLog title="Preset Plan" rows={10} />) : ''}
          <CompletionLog />
        </LogPanel>
      ) : ''}
    </div>
  );
}

export default App;
