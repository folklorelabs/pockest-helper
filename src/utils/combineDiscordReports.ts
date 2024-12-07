import { DiscordEmbed, DiscordFile, Report } from "../api/postDiscord";

export default function combineDiscordReports(reports: Report[]): Report {
  const content = `${reports.map((r) => r.content).filter((r) => r).join('\n')}`;
  const files = reports.reduce((acc, r) => [
    ...acc,
    ...(r.files || []),
  ], [] as DiscordFile[]);
  const embeds = reports.reduce((acc, r) => [
    ...acc,
    ...(r.embeds || []),
  ], [] as DiscordEmbed[]);
  const report = {} as Report;
  if (content) report.content = content;
  if (files?.length) report.files = files;
  if (embeds?.length) report.embeds = embeds;
  return report;
}
