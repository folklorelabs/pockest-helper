import fetchJsonArray from './fetchJsonArray';

let hashesCache;
export default async function fetchAllHashes() {
  if (hashesCache) return hashesCache;
  const hashes = await fetchJsonArray('https://folklorelabs.io/pockest-helper-data/hashes.min.json');
  hashesCache = hashes;
  return hashes;
}
