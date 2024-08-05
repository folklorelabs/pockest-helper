const path = require('path');
const fs = require('fs');

const { version } = require('../package.json');

const SRC = path.resolve(__dirname, '../dist');
const EXT_ASSET_NAME = `PockestHelper_v${version}.xpi`;

(async () => {
  const fullFilePath = `${SRC}/${EXT_ASSET_NAME}`;
  const files = await fs.readdirSync(SRC);
  const xpiFile = files.find((f) => /.*\.xpi$/.test(f));
  await fs.renameSync(`${SRC}/${xpiFile}`, fullFilePath);
  console.log(fullFilePath);
})();
