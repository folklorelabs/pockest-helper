async function getMonsterData() {
  const response = await fetch('https://storage.googleapis.com/pockest-helper/monsters.json');
  const monsters = await response.json();
  return monsters;
}

async function getHashData() {
  const response = await fetch('https://storage.googleapis.com/pockest-helper/hashes.json');
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
  if (request.type === 'POST_DISCORD') {
    (async () => {
      const data = await postDiscordMessage(request.content);
      sendResponse(data);
    })();
    return true;
  }
  return false;
});
