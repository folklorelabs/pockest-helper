import {
  DISCORD_EVO_WEBHOOK,
  DISCORD_MATCH_WEBHOOK,
} from '../config/env';
import logError from './logError';

const URLS = {
  DISCORD_EVO_WEBHOOK,
  DISCORD_MATCH_WEBHOOK,
};

async function postDiscordMessage(content, envUrlId) {
  if (!URLS[envUrlId]) throw new Error(`Missing ${envUrlId} env var`);
  const response = await fetch(URLS[envUrlId], {
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
