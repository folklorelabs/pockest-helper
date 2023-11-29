export default async function postDiscord(content) {
  const res = await chrome.runtime.sendMessage({ type: 'POST_DISCORD', content });
  return res;
}
