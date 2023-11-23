const fs = require('fs');
const PACKAGE = require('../package.json');

const MANIFEST_PATH = './manifest.json';

(async () => {
  const newVersion = PACKAGE && (PACKAGE.version || '').split('-')[0];
  const data = await fs.readFileSync(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(data);
  if (newVersion === manifest.version) return;
  const newManifest = JSON.stringify({
    ...manifest,
    version: newVersion,
  }, null, 2);
  await fs.writeFileSync(MANIFEST_PATH, newManifest);
})();
