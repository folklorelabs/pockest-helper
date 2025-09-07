import type { DiscordEmbed, DiscordFile, Report } from "../api/postDiscord";

export default function combineDiscordReports(reports: Report[]): Report {
	const content = `${reports
		.map((r) => r.content)
		.filter((r) => r)
		.join("\n")}`;
	const files = reports.reduce(
		(acc, r) => {
      const reportFiles = (r.files || []).filter((f) => !!f.name);
      reportFiles.forEach((f) => {
        if (!acc.map((a) => a.name).includes(f.name)) acc.push(f);
      });
      return acc;
    },
		[] as DiscordFile[],
	);
	const embeds = reports.reduce((acc, r) => {
    const reportEmbeds = (r.embeds || []);
    reportEmbeds.forEach((e) => { acc.push(e); });
    return acc;
	}, [] as DiscordEmbed[]);
	const report = {} as Report;
	if (content) report.content = content;
	if (files?.length) report.files = files;
	if (embeds?.length) report.embeds = embeds;
	return report;
}
