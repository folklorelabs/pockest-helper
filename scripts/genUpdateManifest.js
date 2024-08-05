const fs = require('fs');

const GITHUB_RELEASES_URL = 'https://api.github.com/repos/folklorelabs/pockest-helper/releases';
const EXT_RELEASE_ID = 'pockesthelper@folklorelabs.io';
const EXT_RC_ID = 'pockesthelper-beta@folklorelabs.io';

async function fetchJsonArray(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API ${response.status} response (${url})`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected API response type ${typeof data} (${url})`);
  return data;
}

function shapeExtVersion(r) {
  const [version, label = ''] = r.tag_name.replace('v', '').split('-');
  const rcVersion = label.split('.')[1];
  return {
    version: !rcVersion ? version : `${version}.${rcVersion}`,
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
