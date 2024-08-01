const fs = require('fs');

const GITHUB_RELEASES_URL = 'https://api.github.com/repos/folklorelabs/pockest-helper/releases';
const EXT_ASSET_NAME = 'PockestHelper.xpi';
const EXT_ID = 'pockesthelper@folklorelabs.io';

async function fetchJsonArray(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected response type ${typeof data}`);
  return data;
}

(async () => {
  const allReleases = await fetchJsonArray(GITHUB_RELEASES_URL);
  const updates = allReleases.filter((r) => !r.prerelease).map((r) => ({
    version: r.tag_name.replace('v', '').split('-')[0],
    update_link: r.assets.find((a) => a.name === EXT_ASSET_NAME)?.browser_download_url,
  }));
  const updateManifest = {
    addons: {
      [EXT_ID]: {
        updates,
      },
    },
  };
  fs.writeFileSync('./updateManifest.json', JSON.stringify(updateManifest));
})();
