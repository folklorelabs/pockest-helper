import React from 'react';
import cx from 'classnames';
import { pockestActions, usePockestContext } from '../../contexts/PockestContext';
import { useAppContext } from '../../contexts/AppContext';
import LogPanel from '../LogPanel';
import CareLog from '../CareLog';
import MatchDiscoveryLog from '../MatchDiscoveryLog';
import CharacterSprite from '../CharacterSprite';
import PlanLog from '../PlanLog';
import CompletionLog from '../CompletionLog';
import AppMainError from './AppMain--error';
import AppMainLoading from './AppMain--loading';
import AppMainEggPurchase from './AppMain--eggPurchase';
import AppMainCare from './AppMain--care';
import AppMainCareSimple from './AppMain--careSimple';
import AppUpdateAlert from '../AppUpdateAlert';
import { IconChevronDown, IconChevronUp, IconLog } from '../icons';
import './index.css';

function App() {
  const {
    pockestState,
    pockestDispatch,
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
          title={!pockestState.simpleMode ? 'Simple Mode' : 'Advanced Mode'}
          aria-label={!pockestState.simpleMode ? 'Simple Mode' : 'Advanced Mode'}
          className="AppMinBtn"
          type="button"
          onClick={() => pockestDispatch(pockestActions.pockestPlanSettings(pockestState, {
            simpleMode: !pockestState.simpleMode,
          }))}
        >
          <IconLog />
        </button>
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
          <IconLog />
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
          {minimized ? <IconChevronUp /> : <IconChevronDown />}
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
        if (pockestState?.simpleMode) {
          return <AppMainCareSimple />;
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
          <MatchDiscoveryLog title="Newly Discovered Fever Matches" rows={3} />
          {pockestState?.autoPlan ? (<PlanLog title="Preset Plan" rows={10} />) : ''}
          <CompletionLog />
        </LogPanel>
      ) : ''}
    </div>
  );
}

export default App;
