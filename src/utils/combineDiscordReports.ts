export default function combineDiscordReports(reports) {
  const content = `${reports.map((r) => r.content).filter((r) => r).join('\n')}`;
  const files = reports.reduce((acc, r) => [
    ...acc,
    ...(r.files || []),
  ], []);
  const embeds = reports.reduce((acc, r) => [
    ...acc,
    ...(r.embeds || []),
  ], []);
  const report = {};
  if (content) report.content = content;
  if (files?.length) report.files = files;
  if (embeds?.length) report.embeds = embeds;
  return report;
}
