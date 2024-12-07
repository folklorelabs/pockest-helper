const path = require('path');
const fs = require('fs');
const { execSync } = require('node:child_process');
const manifest = require('../dist/manifest.json');
const { version } = require('../package.json');

const EXT_SRC = path.resolve(__dirname, '../dist');
const EXT_WD = path.resolve(__dirname, '../temp');
const EXT_DEST = path.resolve(__dirname, '../artifacts');
const EXT_FILE = `PockestHelper${version.includes('rc') ? '_BETA' : ''}_v${version}.zip`;

async function zip(srcDir, fileName) {
  const extensionZip = `${srcDir}/${fileName}`;
  if (fs.existsSync(extensionZip)) {
    await fs.unlinkSync(extensionZip);
  }
  await execSync(`zip -r9 ./${fileName} ./*`, { cwd: srcDir });
  return extensionZip;
}

async function cleanUpManfiest(dir) {
  const newManifest = JSON.parse(JSON.stringify(manifest));
  delete newManifest.browser_specific_settings;

  // Janky CSP fix (TODO: upgrade @crxjs/vite-plugin once there is a fix)
  // manually strip out "content-script-loader."
  // and the loader script hash (eg ".6894df4c") from cs file refs
  // so the extension loads the script statically instead of dynamically
  const fixedContentScripts = newManifest?.content_scripts?.map((cs) => {
    const js = cs?.js?.map((csPath) => {
      const csMatch = /(.+\/)*(content-script-loader.)([^.]+\.(js|jsx|ts|tsx)\.[^.]+)(\.[^.]+)(\.js)/.exec(csPath);
      if (!csMatch) return csPath;
      const [
        ,
        fileDir,,
        rfileName,
        ,,
        fileExt,
      ] = csMatch;
      return `${fileDir}${rfileName}${fileExt}`;
    });
    return {
      ...cs,
      js,
    };
  });
  newManifest.content_scripts = fixedContentScripts;

  await fs.writeFileSync(`${dir}/manifest.json`, JSON.stringify(newManifest));
}

(async () => {
  // create dupe of src for work
  await fs.cpSync(EXT_SRC, EXT_WD, { recursive: true });

  // remove firefox specific manfiest settings
  await cleanUpManfiest(EXT_WD);

  // zip file
  const fullFilePath = await zip(EXT_WD, EXT_FILE);

  // move file to artifacts
  const destFilePath = `${EXT_DEST}/${EXT_FILE}`;
  if (!fs.existsSync(EXT_DEST)) {
    await fs.mkdirSync(EXT_DEST);
  }
  await fs.renameSync(fullFilePath, destFilePath);

  // clean up
  await fs.rmSync(EXT_WD, { recursive: true, force: true });

  // print abs file path
  // eslint-disable-next-line no-console
  console.log(destFilePath);
})();