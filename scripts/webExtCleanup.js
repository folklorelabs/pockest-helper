const fs = require('fs');

const SRC = './dist';
const EXT_ASSET_NAME = 'PockestHelper.xpi';

(async () => {
  const files = await fs.readdirSync(SRC);
  const xpiFile = files.find((f) => /.*\.xpi$/.test(f));
  await fs.renameSync(`${SRC}/${xpiFile}`, `${SRC}/${EXT_ASSET_NAME}`);
})();
