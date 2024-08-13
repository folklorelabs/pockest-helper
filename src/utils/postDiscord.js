import logError from './logError';

async function postDiscordMessage(content, envUrlId) {
  if (!import.meta.env[envUrlId]) throw new Error(`Missing ${envUrlId} env var`);
  const response = await fetch(import.meta.env[envUrlId], {
    body: JSON.stringify({ content }),
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`API ${response.status} response (${envUrlId})`);
}

export default async function postDiscord(content, envUrlId) {
  try {
    await postDiscordMessage(content, envUrlId);
  } catch (err) {
    logError(`${err}`);
  }
}
