import React from 'react';
import semverLt from 'semver/functions/lt';
import PauseBtn from '../PauseBtn';
import { usePockestContext } from '../../contexts/PockestContext';
import fetchLatestRelease from '../../utils/fetchLatestRelease';
import AppMainContentInitError from './AppMainContent--initError';
import AppMainContentInvalidSession from './AppMainContent--invalidSession';
import AppMainContentLoading from './AppMainContent--loading';
import AppMainContentEggPurchase from './AppMainContent--eggPurchase';
import AppMainContent from './AppMainContent';

function AppMain() {
  const {
    pockestState,
  } = usePockestContext();
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
    <>
      <div className="App-inner">
        {isOutdated ? (
          <p className="App-updateText">
            <a href="https://github.com/folklorelabs/pockest-helper/releases/latest" target="_blank" rel="noreferrer">
              New version available (
              {remoteVersion}
              )
            </a>
          </p>
        ) : ''}
        {(() => {
          if (!pockestState?.initialized && pockestState?.error) {
            return <AppMainContentInitError />;
          }
          if (pockestState?.invalidSession) {
            return <AppMainContentInvalidSession />;
          }
          if (!pockestState?.initialized && pockestState.loading) {
            return <AppMainContentLoading />;
          }
          if (pockestState?.initialized && !pockestState?.data?.monster) {
            return <AppMainContentEggPurchase />;
          }
          return <AppMainContent />;
        })()}
      </div>
      {(!pockestState?.invalidSession
        && pockestState?.initialized && pockestState?.data?.monster) ? (
          <div className="App-footer">
            <div className="App-button">
              <PauseBtn />
            </div>
          </div>
        ) : ''}
    </>
  );
}

export default AppMain;
