const path = require('path');
const fs = require('fs');

const { version } = require('../package.json');

const SRC = path.resolve(__dirname, '../artifacts');
const EXT_ASSET_NAME = `PockestHelper${version.includes('rc') ? '_BETA' : ''}_v${version}.xpi`;

(async () => {
  const fullFilePath = `${SRC}/${EXT_ASSET_NAME}`;
  const files = await fs.readdirSync(SRC);
  const xpiFiles = files.filter((f) => /.*\.xpi$/.test(f));
  if (xpiFiles.length < 1) throw new Error('Unable to proceed. No .xpi file found.');
  if (xpiFiles.length > 1) throw new Error('Unable to proceed. Multiple potential .xpi files found and unable to determine which to rename.');
  await fs.renameSync(`${SRC}/${xpiFiles[0]}`, fullFilePath);
  // eslint-disable-next-line no-console
  console.log(fullFilePath);
})();
