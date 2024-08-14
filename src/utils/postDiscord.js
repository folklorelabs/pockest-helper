import logError from './logError';

export async function postDiscordEvo(content) {
  try {
    const url = import.meta.env.DISCORD_EVO_WEBHOOK;
    if (!url) throw new Error('Missing DISCORD_EVO_WEBHOOK env var');
    const response = await fetch(url, {
      body: JSON.stringify({ content }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`API ${response.status} response (DISCORD_EVO_WEBHOOK)`);
  } catch (err) {
    logError(`${err}`);
  }
}

export async function postDiscordMatch(content) {
  try {
    const url = import.meta.env.DISCORD_MATCH_WEBHOOK;
    if (!url) throw new Error('Missing DISCORD_MATCH_WEBHOOK env var');
    const response = await fetch(url, {
      body: JSON.stringify({ content }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`API ${response.status} response (DISCORD_MATCH_WEBHOOK)`);
  } catch (err) {
    logError(`${err}`);
  }
}
