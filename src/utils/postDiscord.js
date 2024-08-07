import logError from './logError';

async function postDiscordMessage(content) {
  if (!import.meta.env.DISCORD_WEBHOOK) throw new Error('Missing DISCORD_WEBHOOK env var');
  const response = await fetch(import.meta.env.DISCORD_WEBHOOK, {
    body: JSON.stringify({ content }),
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`API ${response.status} response (DISCORD_WEBHOOK)`);
  const data = await response.json();
  if (data.code) throw new Error(`Discord Response: ${data.message} (${data.code})`);
  return data;
}

export default async function postDiscord(content) {
  try {
    const data = await postDiscordMessage(content);
    return data;
  } catch (err) {
    logError(`${err}`);
    return null;
  }
}
