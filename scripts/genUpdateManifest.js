const fs = require('fs');

const GITHUB_RELEASES_URL = 'https://api.github.com/repos/folklorelabs/pockest-helper/releases';
const EXT_RELEASE_ID = 'pockesthelper@folklorelabs.io';
const EXT_RC_ID = 'pockesthelper-beta@folklorelabs.io';

async function fetchJsonArray(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected response type ${typeof data}`);
  return data;
}

function shapeExtVersion(r) {
  return {
    version: r.tag_name.replace('v', '').split('-')[0],
    update_link: r.assets.find((a) => /\.xpi$/.test(a.name))?.browser_download_url,
  };
}

(async () => {
  const allReleases = await fetchJsonArray(GITHUB_RELEASES_URL);
  const updateManifest = {
    addons: {
      [EXT_RELEASE_ID]: {
        updates: allReleases.filter((r) => !r.prerelease).map(shapeExtVersion),
      },
      [EXT_RC_ID]: {
        updates: allReleases.filter((r) => r.prerelease).map(shapeExtVersion),
      },
    },
  };
  fs.writeFileSync('./updateManifest.json', JSON.stringify(updateManifest));
})();
