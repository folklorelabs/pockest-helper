async function getMonsterData() {
  const response = await fetch('https://storage.googleapis.com/pockest-helper/monsters.json');
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
  return false;
});
