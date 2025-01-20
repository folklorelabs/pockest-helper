import React from 'react';
import cx from 'classnames';
import { usePockestContext } from '../../contexts/PockestContext';
import { AppContext } from '../../contexts/AppContext';
import LogPanel from '../LogPanel';
import CareLog from '../CareLog';
import MatchDiscoveryLog from '../MatchDiscoveryLog';
import CharacterSprite from '../CharacterSprite';
import StunSprite from '../StunSprite';
import PlanLog from '../PlanLog';
import CompletionLog from '../CompletionLog';
import AppMainError from './AppMain--error';
import AppMainLoading from './AppMain--loading';
import AppMainEggPurchase from './AppMain--eggPurchase';
import AppMainCare from './AppMain--care';
import AppMainCareSimple from './AppMain--careSimple';
import AppMainCareSimpleError from './AppMain--careSimpleError';
import AppUpdateAlert from '../AppUpdateAlert';
import { IconChevronDown, IconChevronUp, IconLog } from '../icons';
import SimpleModeToggle from '../SimpleModeToggle';
import './index.css';
import AppErrorAlert from '../AppErrorAlert';
import QueueLogEditor from '../QueueLogEditor';

function App() {
  const {
    pockestState,
  } = usePockestContext();
  const {
    showLog,
    setShowLog,
    isOutdated,
  } = React.useContext(AppContext);
  const [minimized, setMinimized] = React.useState(false);
  const [lol, setLol] = React.useState(true);
  const isStunned = pockestState?.data?.monster?.status === 2;
  const isMonsterGone = !pockestState?.data || pockestState?.data?.event === 'monster_not_found';

  return (
    <div className={cx('App', {
      'App--minimized': minimized,
      'App--showLog': showLog,
      'App--hasError': pockestState?.error,
      'App--hasUpdate': isOutdated,
    })}
    >
      <div className="AppMinBtnLayout">
        <button
          title={showLog ? 'Hide log' : 'Show log'}
          aria-label={showLog ? 'Hide log' : 'Show log'}
          className="AppMinBtn"
          type="button"
          onClick={() => {
            if (setShowLog) {
              setShowLog(!showLog);
            }
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
              if (setShowLog) {
                setShowLog(false);
              }
            }
          }}
        >
          {minimized ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </button>
      </div>

      <header className="App-header">
        <p className="App-title">Pockest Helper</p>
        <SimpleModeToggle />
        <AppUpdateAlert />
        <AppErrorAlert />
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
        if (pockestState?.simpleMode && !pockestState?.eggId) {
          return <AppMainCareSimpleError />;
        }
        if (pockestState?.simpleMode) {
          return <AppMainCareSimple />;
        }
        return <AppMainCare />;
      })()}
      <button type="button" tabIndex={-1} className="App-sprite" onClick={() => setLol(!lol)}>
        {lol ? (
          <>
            <CharacterSprite
              action={isMonsterGone ? 'down' : 'idle'}
              animated={!pockestState?.paused}
              randomAnimations={isMonsterGone ? null : [
                'idle',
                isStunned ? 'idle' : 'win',
                isStunned ? 'idle' : 'attack',
              ]}
              randomAnimationWeights={[100, 10, 60]}
            />
            {isStunned ? (
              <StunSprite
                animated={!pockestState?.paused}
              />
            ) : ''}
          </>
        ) : ''}
      </button>
      {(showLog && !minimized) ? (
        <LogPanel>
          <CareLog title="Care Log" rows={22} />
          <QueueLogEditor />
          <MatchDiscoveryLog title="Newly Discovered Fever Matches" rows={3} />
          {pockestState?.autoPlan ? (<PlanLog title="Preset Plan" rows={10} />) : ''}
          <CompletionLog />
        </LogPanel>
      ) : ''}
    </div>
  );
}

export default App;
