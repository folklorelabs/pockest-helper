async function getMonsterData() {
  const response = await fetch('https://storage.googleapis.com/pockest-helper/monsters.json');
  const data = await response.json();
  return data;
}

async function postDiscordMessage(content) {
  if (!import.meta.env.VITE_DISCORD_WEBHOOK) return { error: true };
  const response = await fetch(import.meta.env.VITE_DISCORD_WEBHOOK, {
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
  if (request.type === 'POST_DISCORD') {
    (async () => {
      const data = await postDiscordMessage(request.content);
      sendResponse({ data });
    })();
    return true;
  }
  return false;
});
