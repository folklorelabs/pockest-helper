const path = require('path');
const fs = require('fs');
const { execSync } = require('node:child_process');
const { version } = require('../package.json');

const EXT_SRC = path.resolve(__dirname, '../dist');
const EXT_FILE = `PockestHelper_v${version}.zip`;

async function zip(srcDir, fileName) {
  const extensionZip = `${srcDir}/${fileName}`;
  if (fs.existsSync(extensionZip)) {
    await fs.unlinkSync(extensionZip);
  }
  await execSync(`zip -r9 ./${fileName} ./*`, { cwd: srcDir });
  return extensionZip;
}

(async () => {
  const fullFilePath = await zip(EXT_SRC, EXT_FILE);
  console.log(fullFilePath);
})();
