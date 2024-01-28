async function getMonsterData() {
  const response = await fetch('https://folklorelabs.io/pockest-helper-data/monsters.min.json');
  const monsters = await response.json();
  return monsters;
}

async function getHashData() {
  const response = await fetch('https://folklorelabs.io/pockest-helper-data/hashes.min.json');
  const monsters = await response.json();
  return monsters;
}

async function postDiscordMessage(content) {
  if (!import.meta.env.DISCORD_WEBHOOK) return { message: 'Missing DISCORD_WEBHOOK env var' };
  const response = await fetch(import.meta.env.DISCORD_WEBHOOK, {
    body: JSON.stringify({ content }),
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  const data = await response.json();
  return data;
}

async function getLatestRelease() {
  const response = await fetch('https://api.github.com/repos/folklorelabs/pockest-helper/releases');
  const res = await response.json();
  if (!Array.isArray(res)) throw new Error(`[fetchLatestRelease] Unexpected response type ${typeof res}`);
  const latestRelease = res.find((r) => !r.prerelease);
  return latestRelease;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_MONSTERS') {
    (async () => {
      const monsters = await getMonsterData();
      sendResponse({ monsters });
    })();
    return true;
  }
  if (request.type === 'GET_HASHES') {
    (async () => {
      const hashes = await getHashData();
      sendResponse({ hashes });
    })();
    return true;
  }
  if (request.type === 'GET_LATEST_RELEASE') {
    (async () => {
      const release = await getLatestRelease();
      sendResponse({ release });
    })();
    return true;
  }
  if (request.type === 'POST_DISCORD') {
    (async () => {
      const data = await postDiscordMessage(request.content);
      sendResponse(data);
    })();
    return true;
  }
  return false;
});
