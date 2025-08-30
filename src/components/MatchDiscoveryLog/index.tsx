import React from 'react';
import { z } from 'zod';
import {
  getDiscordCooldown,
  getDiscordReportStatus,
  postDiscordMatch,
} from '../../api/postDiscord';
import APP_NAME from '../../constants/APP_NAME';
import {
  pockestGetters,
  usePockestContext,
} from '../../contexts/PockestContext';
import { exchangeLogEntrySchema } from '../../contexts/PockestContext/schemas/logEntrySchema';
import combineDiscordReports from '../../utils/combineDiscordReports';
import getMatchReportString from '../../utils/getMatchReportString';
import './index.css';

interface MatchDiscoveryLogProps {
  title?: string;
  rows?: number;
}

const MatchDiscoveryLog: React.FC<MatchDiscoveryLogProps> = ({
  title = 'Log',
  rows = 12,
}) => {
  const [discordCooldown, setDiscordCooldown] = React.useState(
    getDiscordCooldown() || 0,
  );
  const textAreaEl = React.useRef<HTMLTextAreaElement>(null);
  const { pockestState } = usePockestContext();
  const contentData = React.useMemo(() => {
    const d = pockestState?.log?.filter(
      (entry) => entry.logType === 'exchange',
    );
    return d.filter(
      (entry) =>
        entry.logType === 'exchange' &&
        pockestGetters.isMatchDiscovery(
          pockestState,
          entry as z.infer<typeof exchangeLogEntrySchema>,
        ),
    );
  }, [
    pockestState,
  ]);
  const content = React.useMemo(
    () =>
      contentData
        .map((entry) =>
          getMatchReportString({
            pockestState,
            result: entry,
          }),
        )
        .join('\n'),
    [
      contentData,
      pockestState,
    ],
  );
  React.useEffect(() => {
    if (!textAreaEl?.current) return () => {};
    textAreaEl.current.scrollTop = textAreaEl.current.scrollHeight;
    return () => {};
  }, [
    content,
  ]);
  React.useEffect(() => {
    const interval = window.setInterval(() => {
      const newCooldown = getDiscordCooldown();
      if (typeof newCooldown === 'number') setDiscordCooldown(newCooldown);
    }, 500);
    return () => {
      window.clearInterval(interval);
    };
  }, []);
  if (!contentData?.length) return '';
  return (
    <div className="MatchDiscoveryLog">
      <header className="MatchDiscoveryLog-header">
        <p className="MatchDiscoveryLog-title">
          {title} ({contentData?.length || 0})
        </p>
      </header>
      <div className="MatchDiscoveryLog-content">
        <textarea
          ref={textAreaEl}
          className="PockestTextArea MatchDiscoveryLog-textarea"
          value={`[${APP_NAME}]\n${content}`}
          readOnly
          rows={rows}
        />
        <div className="MatchDiscoveryLog-buttons">
          <button
            type="button"
            className="PockestLink MatchDiscoveryLog-copy"
            aria-label={`Copy ${title.toLowerCase()} to clipboard`}
            onClick={() => navigator.clipboard.writeText(content)}
          >
            📋 Copy
          </button>
          {!getDiscordReportStatus() ? (
            <button
              type="button"
              className="PockestLink MatchDiscoveryLog-clear"
              aria-label={`Clear ${title.toLowerCase()}`}
              onClick={async () => {
                if (discordCooldown) return;
                const reports = contentData.map((matchEntry) =>
                  pockestGetters.getDiscordReportMatch(
                    pockestState,
                    matchEntry,
                    matchEntry?.target_monster_name_en,
                  ),
                );
                const report = combineDiscordReports(reports);
                await postDiscordMatch(report);
              }}
              disabled={!!discordCooldown}
              title={
                discordCooldown
                  ? 'Please wait 60 seconds before submitting again'
                  : 'Manually submit a report in automated report failed'
              }
            >
              💬 Discord Report
              {discordCooldown ? ` (${discordCooldown})` : ''}
            </button>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDiscoveryLog;
