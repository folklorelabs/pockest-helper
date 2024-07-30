function generateErrorResponse(id, err) {
  return {
    error: `[service-worker:${id}] ${err}`,
  };
}

async function fetchJsonArray(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Network error (${response.status})`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected response type ${typeof data}`);
  return data;
}

async function postDiscordMessage(content) {
  if (!import.meta.env.DISCORD_WEBHOOK) throw new Error('Missing DISCORD_WEBHOOK env var');
  const response = await fetch(import.meta.env.DISCORD_WEBHOOK, {
    body: JSON.stringify({ content }),
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Network error (${response.status} ${response.statusText})`);
  const data = await response.json();
  if (data.code) throw new Error(`${data.message} (${data.code})`);
  return data;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_MONSTERS') {
    (async () => {
      try {
        const monsters = await fetchJsonArray('https://folklorelabs.io/pockest-helper-data/monsters.min.json');
        sendResponse({ monsters });
      } catch (err) {
        sendResponse(generateErrorResponse('GET_MONSTERS', err));
      }
    })();
    return true;
  }
  if (request.type === 'GET_HASHES') {
    (async () => {
      try {
        const hashes = await fetchJsonArray('https://folklorelabs.io/pockest-helper-data/hashes.min.json');
        sendResponse({ hashes });
      } catch (err) {
        sendResponse(generateErrorResponse('GET_HASHES', err));
      }
    })();
    return true;
  }
  if (request.type === 'GET_LATEST_RELEASE') {
    (async () => {
      try {
        const release = await fetchJsonArray('https://api.github.com/repos/folklorelabs/pockest-helper/releases');
        sendResponse({ release });
      } catch (err) {
        sendResponse(generateErrorResponse('GET_LATEST_RELEASE', err));
      }
    })();
    return true;
  }
  if (request.type === 'POST_DISCORD') {
    (async () => {
      try {
        const data = await postDiscordMessage(request.content);
        sendResponse(data);
      } catch (err) {
        sendResponse(generateErrorResponse('POST_DISCORD', err));
      }
    })();
    return true;
  }
  return false;
});
