import browser from 'webextension-polyfill';

export default async function postDiscord(content) {
  const data = await browser.runtime.sendMessage({ type: 'POST_DISCORD', content });
  if (data?.error) {
    console.error(`${data.error}`);
  }
  return data;
}
