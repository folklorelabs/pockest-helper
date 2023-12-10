import React from 'react';
import cx from 'classnames';
import semverLt from 'semver/functions/lt';
import Lifecycle from './Lifecycle';
import PauseBtn from '../PauseBtn';
import AutoPlanControls from '../AutoPlanControls';
import CleanControls from '../CleanControls';
import FeedControls from '../FeedControls';
import MatchControls from '../MatchControls';
import TrainControls from '../TrainControls';
import BuyEggBtn from '../BuyEggBtn';
import { usePockestContext } from '../../contexts/PockestContext';
import { useAppContext } from '../../contexts/AppContext';
import EggControls from '../EggControls';
import LogPanel from '../LogPanel';
import CareLog from '../CareLog';
import CureControls from '../CureControls';
import CharacterSprite from '../CharacterSprite';
import fetchLatestRelease from '../../utils/fetchLatestRelease';
import './index.css';

function App() {
  const {
    pockestState,
  } = usePockestContext();
  const {
    showLog,
  } = useAppContext();
  const [minimized, setMinimized] = React.useState(false);
  const [lol, setLol] = React.useState(true);
  const [remoteVersion, setRemoteVersion] = React.useState();
  React.useEffect(() => {
    (async () => {
      const latestRelease = await fetchLatestRelease();
      setRemoteVersion(latestRelease?.tag_name);
    })();
  }, []);
  const isOutdated = React.useMemo(() => {
    const curVersion = import.meta.env.APP_VERSION;
    if (!remoteVersion || !curVersion) return false;
    return semverLt(
      curVersion,
      remoteVersion,
    );
  }, [remoteVersion]);
  return (
    <div className={cx('App', { 'App--minimized': minimized })}>
      <Lifecycle />
      <button className="AppMinBtn" type="button" onClick={() => setMinimized(!minimized)}>
        ⧉
      </button>
      <header className="App-header">
        <p className="App-title">Pockest Helper</p>
      </header>
      {!pockestState?.initialized || pockestState?.data?.monster ? (
        <>
          <AutoPlanControls />
          <hr />
          <CleanControls />
          <hr />
          <FeedControls />
          <hr />
          <TrainControls />
          <hr />
          <MatchControls />
          <hr />
          <CureControls />
          <div className="App-button">
            <PauseBtn />
          </div>
          <div className="App-footer">
            {isOutdated ? (
              <p>
                <a href="https://github.com/folklorelabs/pockest-helper/releases/latest" target="_blank" rel="noreferrer">
                  Pockest Helper upgrade available (
                  {`v${import.meta.env.APP_VERSION}`}
                  {' → '}
                  {remoteVersion}
                  )
                </a>
              </p>
            ) : ''}
          </div>
        </>
      ) : (
        <>
          <EggControls />
          <div className="App-button">
            <BuyEggBtn />
          </div>
        </>
      )}
      {showLog && !minimized ? (
        <LogPanel>
          <CareLog title="Care Log" rows={36} />
          <CareLog title="Newly Discovered Fever Matches" logTypes={['exchange']} onlyDiscoveries allowClear={false} />
        </LogPanel>
      ) : ''}
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
    </div>
  );
}

export default App;
