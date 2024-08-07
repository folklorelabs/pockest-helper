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
  const data = await response.json();
  if (data.code) throw new Error(`Discord Response: ${data.message} (${data.code})`);
  return data;
}

export default async function postDiscord(content, envUrlId) {
  try {
    const data = await postDiscordMessage(content, envUrlId);
    return data;
  } catch (err) {
    logError(`${err}`);
    return null;
  }
}
