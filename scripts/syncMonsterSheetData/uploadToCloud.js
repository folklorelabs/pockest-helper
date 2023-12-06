require('dotenv').config();
const { Storage } = require('@google-cloud/storage');

const STORAGE = new Storage();
const PUBLIC_BUCKET = STORAGE.bucket('pockest-helper');
const CACHE_CONTROL = 'public, max-age=300'; // 3600 = 1 hr

async function uploadToCloud(data, fileName) {
  const destMeta = PUBLIC_BUCKET.file(fileName);
  await destMeta.save(JSON.stringify(data));
  await destMeta.setMetadata({
    cacheControl: CACHE_CONTROL,
    contentType: 'application/json',
  });
}

module.exports = uploadToCloud;
