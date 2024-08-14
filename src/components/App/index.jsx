import React from 'react';
import cx from 'classnames';
import { usePockestContext } from '../../contexts/PockestContext';
import { useAppContext } from '../../contexts/AppContext';
import LogPanel from '../LogPanel';
import CareLog from '../CareLog';
import CharacterSprite from '../CharacterSprite';
import PlanLog from '../PlanLog';
import CompletionLog from '../CompletionLog';
import AppMainError from './AppMain--error';
import AppMainLoading from './AppMain--loading';
import AppMainEggPurchase from './AppMain--eggPurchase';
import AppMainCare from './AppMain--care';
import './index.css';
import AppUpdateAlert from '../AppUpdateAlert';
import { IconChevronDown, IconChevronUp, IconLog } from '../icons';

function App() {
  const {
    pockestState,
  } = usePockestContext();
  const {
    showLog,
    setShowLog,
  } = useAppContext();
  const [minimized, setMinimized] = React.useState(false);
  const [lol, setLol] = React.useState(true);

  return (
    <div className={cx('App', { 'App--minimized': minimized })}>
      <div className="AppMinBtnLayout">
        <button
          title={showLog ? 'Hide log' : 'Show log'}
          aria-label={showLog ? 'Hide log' : 'Show log'}
          className="AppMinBtn"
          type="button"
          onClick={() => {
            setShowLog(!showLog);
            setMinimized(false);
          }}
        >
          <IconLog size={16} />
        </button>
        <button
          title={minimized ? 'Maximize' : 'Minimize'}
          aria-label={minimized ? 'Maximize' : 'Minimize'}
          className="AppMinBtn"
          type="button"
          onClick={() => {
            setMinimized(!minimized);
            if (!minimized) {
              setShowLog(false);
            }
          }}
        >
          {minimized ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </button>
      </div>

      <header className="App-header">
        <p className="App-title">Pockest Helper</p>
        <AppUpdateAlert />
      </header>
      {(() => {
        if (pockestState?.invalidSession) {
          return <AppMainError msg="Your session appears to be invalid. Did you open Pockest Helper in another tab?" />;
        }
        if (!pockestState?.initialized && pockestState?.error?.includes('403') && pockestState?.error?.includes('buckler')) {
          return <AppMainError msg="Please ensure you are logged into Buckler (403 Auth Error)" />;
        }
        if (!pockestState?.initialized && pockestState?.error) {
          return <AppMainError msg="We encountered a critical error and were unable to initialize" />;
        }
        if (!pockestState?.initialized) {
          return <AppMainLoading />;
        }
        if (pockestState?.initialized && !pockestState?.data?.monster) {
          return <AppMainEggPurchase />;
        }
        return <AppMainCare />;
      })()}
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
