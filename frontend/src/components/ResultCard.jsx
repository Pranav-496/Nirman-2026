import { ShieldCheck, ShieldAlert, ShieldX, Database, Hash, Brain, FileCheck, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ConfidenceBar from './ConfidenceBar';

const verdictConfig = {
  VALID: {
    label: 'VERIFIED',
    sublabel: 'This certificate has been successfully verified',
    icon: ShieldCheck,
    color: 'text-valid',
    bg: 'bg-valid-muted border border-valid/20',
    glow: 'glow-valid',
    badge: 'bg-valid-muted text-valid',
  },
  SUSPICIOUS: {
    label: 'SUSPICIOUS',
    sublabel: 'This certificate could not be fully verified',
    icon: ShieldAlert,
    color: 'text-suspicious',
    bg: 'bg-suspicious-muted border border-suspicious/20',
    glow: 'glow-suspicious',
    badge: 'bg-suspicious-muted text-suspicious',
  },
  FAKE: {
    label: 'INVALID',
    sublabel: 'This certificate appears to be fraudulent',
    icon: ShieldX,
    color: 'text-fake',
    bg: 'bg-fake-muted border border-fake/20',
    glow: 'glow-fake',
    badge: 'bg-fake-muted text-fake',
  },
};

function CheckRow({ icon: Icon, label, passed, detail, delay = 0 }) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b border-border-light last:border-0 animate-slide-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-2.5 text-sm text-fg-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${passed ? 'bg-valid-muted' : 'bg-fake-muted'}`}>
          <Icon className={`w-3.5 h-3.5 ${passed ? 'text-valid' : 'text-fake'}`} />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {detail && <span className="text-xs text-fg-3 font-mono">{detail}</span>}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          passed ? 'bg-valid-muted text-valid' : 'bg-fake-muted text-fake'
        }`}>
          {passed ? '✓ Pass' : '✗ Fail'}
        </span>
      </div>
    </div>
  );
}

export default function ResultCard({ data }) {
  const [hashCopied, setHashCopied] = useState(false);

  if (!data) return null;

  const { verdict, score, extracted_fields, checks, computed_hash, message } = data;
  const cfg = verdictConfig[verdict] || verdictConfig.FAKE;
  const VerdictIcon = cfg.icon;

  const copyHash = () => {
    navigator.clipboard.writeText(computed_hash);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  return (
    <div className={`card overflow-hidden ${cfg.glow} animate-scale-in`}>
      {/* Verdict Banner */}
      <div className={`px-6 py-5 ${cfg.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.badge}`}>
            <VerdictIcon className={`w-7 h-7 ${cfg.color}`} />
          </div>
          <div>
            <h2 className={`text-2xl font-bold tracking-tight ${cfg.color}`}>{cfg.label}</h2>
            <p className="text-sm text-fg-2 mt-0.5">{message || cfg.sublabel}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Confidence */}
        <ConfidenceBar score={score} verdict={verdict} />

        {/* Checks */}
        <div>
          <h3 className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-3">Verification Checks</h3>
          <div className="card p-4">
            <CheckRow icon={Database} label="Database Record Match" passed={checks.db_match} delay={0.1} />
            <CheckRow icon={Hash} label="SHA-256 Hash Integrity" passed={checks.hash_match} delay={0.2} />
            <CheckRow
              icon={Brain}
              label="AI Tampering Analysis"
              passed={checks.tamper_score < 0.5}
              detail={`${(checks.tamper_score * 100).toFixed(0)}%`}
              delay={0.3}
            />
            <CheckRow
              icon={FileCheck}
              label="Field Extraction Completeness"
              passed={checks.fields_complete >= 0.6}
              detail={`${(checks.fields_complete * 100).toFixed(0)}%`}
              delay={0.4}
            />
          </div>
        </div>

        {/* Extracted Fields */}
        <div>
          <h3 className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-3">Extracted Certificate Data</h3>
          <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['Certificate ID', extracted_fields.cert_id],
              ['Student Name', extracted_fields.name],
              ['Institution', extracted_fields.institution],
              ['Year', extracted_fields.year],
              ['Grade', extracted_fields.grade],
            ].map(([label, value], i) => (
              <div
                key={label}
                className={`animate-slide-up ${label === 'Institution' ? 'sm:col-span-2' : ''}`}
                style={{animationDelay: `${0.3 + i * 0.05}s`}}
              >
                <p className="text-[11px] font-medium text-fg-3 uppercase tracking-wider mb-0.5">{label}</p>
                <p className={`text-sm font-semibold ${value ? 'text-fg' : 'text-fg-3 italic'}`}>
                  {value || 'Not detected'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Hash */}
        {computed_hash && (
          <div>
            <h3 className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-3">SHA-256 Digital Fingerprint</h3>
            <div className="card p-3 flex items-center justify-between gap-3">
              <code className="text-xs text-primary-light break-all font-mono flex-1">{computed_hash}</code>
              <button
                onClick={copyHash}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-bg-3 hover:bg-primary-muted transition-colors"
                title="Copy hash"
              >
                {hashCopied ? (
                  <Check className="w-3.5 h-3.5 text-valid" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-fg-3" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
