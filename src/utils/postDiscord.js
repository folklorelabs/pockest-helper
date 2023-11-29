export default async function postDiscord(content) {
  const res = await chrome.runtime.sendMessage({ type: 'POST_DISCORD', content });
  if (res.error) console.error(`[postDiscord] ERROR: ${res.error}`);
  return res;
}
