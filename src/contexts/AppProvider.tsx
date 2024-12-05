import React from 'react';
import semverLt from 'semver/functions/lt';
import debounce from '../utils/debounce';
import fetchLatestReleases from '../api/fetchLatestRelease';

import { AppContext, APP_CONTEXT_INITIAL_STATE } from '../contexts/AppContext';

// TYPES
interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({
  children,
}: AppProviderProps) {
  const [showLog, setShowLog] = React.useState(APP_CONTEXT_INITIAL_STATE.showLog);
  const [winWidth, setWinWidth] = React.useState(window.innerWidth);
  const [remoteVersion, setRemoteVersion] = React.useState<string>();
  const logStyle = React.useMemo((): 'default' | 'compact' => (winWidth >= 768 ? 'default' : 'compact'), [winWidth]);

  React.useEffect(() => {
    const resizeHandler = debounce(() => setWinWidth(window.innerWidth));
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  React.useEffect(() => {
    (async () => {
      const latestRelease = await fetchLatestReleases();
      setRemoteVersion(latestRelease?.tag_name);
    })();
  }, []);

  const isOutdated = React.useMemo(() => {
    const curVersion = import.meta.env.VITE_APP_VERSION;
    if (!remoteVersion || !curVersion) return false;
    return semverLt(
      curVersion,
      remoteVersion,
    );
  }, [remoteVersion]);

  // wrap value in memo so we only re-render when necessary
  const providerValue = React.useMemo(() => ({
    showLog,
    setShowLog,
    logStyle,
    remoteVersion,
    isOutdated,
  }), [showLog, logStyle, remoteVersion, isOutdated]);

  return (
    <AppContext.Provider value={providerValue}>
      {children}
    </AppContext.Provider>
  );
}
