import APP_NAME from '../constants/APP_NAME';
import logError from '../utils/logError';

const DISCORD_ATTEMPT_TIMESTAMP_ID = 'PockestHelperTimeout-discordReportAttempt';
const DISCORD_SUCCESS_TIMESTAMP_ID = 'PockestHelperTimeout-discordReportSuccess';
const DISCORD_COOLDOWN = 1000 * 60;

export type DiscordEmbed = {
  description?: string;
  color?: number;
  author?: {
    name?: string;
  };
  thumbnail?: {
    url?: string;
  };
  url?: string;
}

export type DiscordFile = {
  name: string;
  base64: string;
}

export type DiscordAttachment = {
  id: number;
  filename: string;
  description: string;
}

export type Report = {
  content?: string;
  embeds?: DiscordEmbed[];
  files?: DiscordFile[];
  attachments?: DiscordAttachment[];
};

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

const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export async function postDiscord(id: string, url: string, report: Report) {
  try {
    window.sessionStorage.setItem(DISCORD_ATTEMPT_TIMESTAMP_ID, `${Date.now()}`);
    if (!url) throw new Error(`Missing ${id} env var`);

    if (report?.embeds && report?.embeds?.length > 10) {
      const batchedReports = report.embeds.reduce((acc, embed, index) => {
        const batchIndex = Math.floor(index / 8);
        acc[batchIndex] = acc[batchIndex] || report;
        if (!acc[batchIndex].embeds) acc[batchIndex].embeds = [];
        if (!acc[batchIndex].files) acc[batchIndex].files = [];
        acc[batchIndex].embeds.push(embed);
        if (report?.files?.[index]) acc[batchIndex].files.push(report.files[index]);
        return acc;
      }, [] as Report[]);
      await Promise.all(batchedReports.map(async (r) => postDiscord(id, url, r)));
      return;
    }

    const headers = new Headers();
    const body = new FormData();
    report?.files?.forEach((fileMeta, index) => {
      const b64Data = fileMeta?.base64?.split('base64,')[1];
      body.append(`file[${index + 1}]`, b64toBlob(b64Data), fileMeta.name);
    });
    const payload = {} as Report;
    if (report?.content) payload.content = report?.content;
    if (report?.attachments) payload.attachments = report?.attachments;
    if (report?.embeds) {
      payload.embeds = report?.embeds?.map((embed) => ({
        ...embed,
        footer: {
          text: APP_NAME,
        },
      }));
    } else {
      payload.content = `*[${APP_NAME}]*${report?.content ? `\n${report?.content}` : ''}`;
    }
    body.append('payload_json', JSON.stringify(payload));
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`API ${response.status} response (${id})`);
    window.sessionStorage.setItem(DISCORD_SUCCESS_TIMESTAMP_ID, `${Date.now()}`);
  } catch (err) {
    logError(`${err}`);
  }
}

export async function postDiscordEvo(report: Report) {
  await postDiscord('VITE_DISCORD_WEBHOOK_EVO', import.meta.env.VITE_DISCORD_WEBHOOK_EVO, report);
}

export async function postDiscordMatch(report: Report) {
  await postDiscord('VITE_DISCORD_WEBHOOK_MATCH', import.meta.env.VITE_DISCORD_WEBHOOK_MATCH, report);
}

export async function postDiscordTest(report: Report) {
  await postDiscord('VITE_DISCORD_WEBHOOK_TEST', import.meta.env.VITE_DISCORD_WEBHOOK_TEST, report);
}
