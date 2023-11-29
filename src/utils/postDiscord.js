export default async function postDiscord(content) {
  const data = await chrome.runtime.sendMessage({ type: 'POST_DISCORD', content });
  if (data?.message) console.error(`[postDiscord] ERROR: ${data.message}`);
  return data;
}
