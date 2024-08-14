import React from 'react';
import semverLt from 'semver/functions/lt';
import fetchLatestRelease from '../../utils/fetchLatestRelease';

function AppUpdateAlert() {
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
  if (!isOutdated) return '';
  return (
    <p className="AppUpdateAlert">
      <a href={`https://github.com/folklorelabs/pockest-helper/releases/${remoteVersion}`} target="_blank" rel="noreferrer">
        New version available (
        {remoteVersion}
        )
      </a>
    </p>
  );
}

export default AppUpdateAlert;
