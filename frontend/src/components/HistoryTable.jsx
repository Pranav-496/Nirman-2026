import { ShieldCheck, ShieldAlert, ShieldX, Clock } from 'lucide-react';

const verdictBadge = {
  VALID: { icon: ShieldCheck, label: 'Valid', cls: 'bg-valid-muted text-valid' },
  SUSPICIOUS: { icon: ShieldAlert, label: 'Suspicious', cls: 'bg-suspicious-muted text-suspicious' },
  FAKE: { icon: ShieldX, label: 'Invalid', cls: 'bg-fake-muted text-fake' },
};

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function HistoryTable({ entries = [], compact = false }) {
  if (!entries.length) {
    return (
      <div className="card p-8 text-center">
        <Clock className="w-10 h-10 text-fg-3 mx-auto mb-3" />
        <p className="text-sm text-fg-3">No verification history yet</p>
        <p className="text-xs text-fg-3 mt-1">Verify a certificate to see results here</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left py-3 px-4 text-xs font-semibold text-fg-3 uppercase tracking-wider">Certificate ID</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-fg-3 uppercase tracking-wider">Verdict</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-fg-3 uppercase tracking-wider">Score</th>
              {!compact && (
                <th className="text-left py-3 px-4 text-xs font-semibold text-fg-3 uppercase tracking-wider">Time</th>
              )}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const v = verdictBadge[entry.verdict] || verdictBadge.FAKE;
              const VIcon = v.icon;
              return (
                <tr
                  key={i}
                  className="border-b border-border-light last:border-0 hover:bg-hover transition-colors animate-slide-up"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <td className="py-3 px-4">
                    <span className="font-mono font-medium text-fg text-xs">{entry.cert_id || '—'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${v.cls}`}>
                      <VIcon className="w-3 h-3" />
                      {v.label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-fg-2 text-xs">{entry.score?.toFixed(1) ?? '—'}%</span>
                  </td>
                  {!compact && (
                    <td className="py-3 px-4">
                      <span className="text-xs text-fg-3">{entry.timestamp ? timeAgo(entry.timestamp) : '—'}</span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
