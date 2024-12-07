import CharAsset from "../types/BucklerCharAsset";

async function fetchCharAsset(hash:string):Promise<CharAsset> {
    if (!hash) {
      throw new Error(`Invalid hash ${hash}`);
    }
    const url = `https://www.streetfighter.com/6/buckler/assets/minigame/img/char/${hash}.json`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Network error ${res.status} (${url})`);
    }
    const charAssets = await res.json();
    return charAssets;
}

export default fetchCharAsset;
