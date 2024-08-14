import logError from './logError';

export async function postDiscord(content, url, id) {
  try {
    if (!url) throw new Error(`Missing ${id} env var`);
    const response = await fetch(url, {
      body: JSON.stringify({ content }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`API ${response.status} response (${id})`);
  } catch (err) {
    logError(`${err}`);
  }
}

export async function postDiscordEvo(content) {
  await postDiscord(content, import.meta.env.DISCORD_WEBHOOK_EVO, 'DISCORD_WEBHOOK_EVO');
}

export async function postDiscordMatch(content) {
  await postDiscord(content, import.meta.env.DISCORD_WEBHOOK_MATCH, 'DISCORD_WEBHOOK_MATCH');
}
