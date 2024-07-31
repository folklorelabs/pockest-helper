const fs = require('fs');

async function fetchJsonArray(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected response type ${typeof data}`);
  return data;
}

(async () => {
  const allReleases = await fetchJsonArray('https://api.github.com/repos/folklorelabs/pockest-helper/releases');
  const updates = allReleases.filter((r) => !r.prerelease).map((r) => ({
    version: r.tag_name.replace('v', '').split('-')[0],
    update_link: r.assets.find((a) => a.name === 'PockestHelper.zip')?.browser_download_url,
  }));
  const updateManifest = {
    addons: {
      updates,
    },
  };
  fs.writeFileSync('./updateManifest.json', JSON.stringify(updateManifest));
})();
