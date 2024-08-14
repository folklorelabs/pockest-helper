import logError from './logError';

const DISCORD_ATTEMPT_TIMESTAMP_ID = 'PockestHelperTimeout-discordReportAttempt';
const DISCORD_SUCCESS_TIMESTAMP_ID = 'PockestHelperTimeout-discordReportSuccess';
const DISCORD_COOLDOWN = 1000 * 60;

export function getDiscordCooldown() {
  const lastDiscordAttemptStr = window.sessionStorage.getItem(DISCORD_ATTEMPT_TIMESTAMP_ID);
  if (!lastDiscordAttemptStr) return null;
  const lastDiscordAttempt = parseInt(lastDiscordAttemptStr, 10);
  const now = Date.now();
  const target = lastDiscordAttempt + DISCORD_COOLDOWN;
  const diff = Math.max(0, Math.ceil((target - now) / 1000));
  return diff;
}

export function getDiscordReportStatus() {
  const lastDiscordAttemptStr = window.sessionStorage.getItem(DISCORD_ATTEMPT_TIMESTAMP_ID);
  if (!lastDiscordAttemptStr) return true;
  const lastDiscordSuccessStr = window.sessionStorage.getItem(DISCORD_SUCCESS_TIMESTAMP_ID);
  if (!lastDiscordSuccessStr) return false;
  const lastDiscordAttempt = parseInt(lastDiscordAttemptStr, 10);
  const lastDiscordSuccess = parseInt(lastDiscordSuccessStr, 10);
  return lastDiscordSuccess >= lastDiscordAttempt;
}

export async function postDiscord(content, url, id) {
  try {
    window.sessionStorage.setItem(DISCORD_ATTEMPT_TIMESTAMP_ID, Date.now());
    if (!url) throw new Error(`Missing ${id} env var`);
    const response = await fetch(url, {
      body: JSON.stringify({ content: `[Pockest Helper v${import.meta.env.APP_VERSION}]\n${content}` }),
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`API ${response.status} response (${id})`);
    window.sessionStorage.setItem(DISCORD_SUCCESS_TIMESTAMP_ID, Date.now());
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
