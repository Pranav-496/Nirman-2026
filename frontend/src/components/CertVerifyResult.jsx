import { useState } from 'react';
import { ShieldCheck, ShieldX, Link2, User, ExternalLink, Copy, Check, AlertTriangle, QrCode, Search, Type, Globe } from 'lucide-react';

const METHOD_LABELS = {
  qr:     { label: 'QR Code Detected',  icon: QrCode,  color: 'text-valid',          bg: 'bg-green-500/10' },
  ocr:    { label: 'OCR URL Detected',  icon: Search,  color: 'text-blue-400',       bg: 'bg-blue-500/10'  },
  opencv: { label: 'OpenCV Scan',       icon: Search,  color: 'text-cyan-400',       bg: 'bg-cyan-500/10'  },
  manual: { label: 'Manual Input',      icon: Type,    color: 'text-amber-400',      bg: 'bg-amber-500/10' },
  none:   { label: 'Not Detected',      icon: ShieldX, color: 'text-red-400',        bg: 'bg-red-500/10'   },
};

function SafeRing({ score = 0, isVerified = false }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const safeScore = Math.max(0, Math.min(1, isNaN(score) ? 0 : score));
  const offset = circ * (1 - safeScore);
  const pct = Math.round(safeScore * 100);
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" strokeWidth="5"
            stroke={isVerified ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'} />
          <circle cx="40" cy="40" r={r} fill="none" strokeWidth="5"
            stroke={isVerified ? '#10B981' : '#EF4444'}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <span className={`text-lg font-bold z-10 ${isVerified ? 'text-green-400' : 'text-red-400'}`}>
          {pct}%
        </span>
      </div>
      <p className="text-[9px] font-medium text-fg-3 uppercase tracking-widest mt-1">Match Score</p>
    </div>
  );
}

export default function CertVerifyResult({ data, onReset }) {
  const [urlCopied, setUrlCopied] = useState(false);

  // Full null guard — never crash
  if (!data) return null;

  try {
    const { verdict, link_result = {}, message = '', detected_urls = [] } = data;
    const isVerified = verdict === 'VERIFIED';
    const methodKey = link_result?.method || 'none';
    const method = METHOD_LABELS[methodKey] || METHOD_LABELS.none;
    const MethodIcon = method.icon;
    const matchScore = typeof link_result?.match_score === 'number' ? link_result.match_score : 0;

    const copyUrl = () => {
      if (link_result?.url) {
        navigator.clipboard.writeText(link_result.url).catch(() => {});
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      }
    };

    return (
      <div className="space-y-5 animate-scale-in">

        {/* ── Verdict Banner ── */}
        <div className={`rounded-2xl overflow-hidden border-2 ${
          isVerified ? 'border-green-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                     : 'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
        }`}>
          {/* Header */}
          <div className={`px-6 py-5 flex items-center gap-4 ${
            isVerified ? 'bg-green-500/10' : 'bg-red-500/10'
          }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${
              isVerified
                ? 'bg-green-500/15 border-green-500/30 animate-stamp-in'
                : 'bg-red-500/15 border-red-500/30 animate-shake-error'
            }`}>
              {isVerified
                ? <ShieldCheck className="w-7 h-7 text-green-400" />
                : <ShieldX className="w-7 h-7 text-red-400" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isVerified ? 'text-green-400' : 'text-red-400'}`}>
                {verdict}
              </h2>
              <p className="text-sm text-fg-2 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 bg-bg-2/50">

            {/* Detection method */}
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${method.bg}`}>
                <MethodIcon className={`w-4 h-4 ${method.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-wider">Detection Method</p>
                <p className={`text-sm font-semibold ${method.color}`}>{method.label}</p>
              </div>
            </div>

            {/* Verification URL */}
            {link_result?.url && (
              <div>
                <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-wider mb-2">Verification URL</p>
                <div className="rounded-xl border border-border-light bg-bg-3 p-3 flex items-center gap-3">
                  <Link2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <a href={link_result.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-400 break-all font-mono flex-1 hover:underline min-w-0">
                    {link_result.url}
                  </a>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a href={link_result.url} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-elevated hover:bg-primary/10 transition-colors" title="Open">
                      <ExternalLink className="w-3.5 h-3.5 text-fg-3" />
                    </a>
                    <button onClick={copyUrl}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-elevated hover:bg-primary/10 transition-colors" title="Copy">
                      {urlCopied
                        ? <Check className="w-3.5 h-3.5 text-green-400" />
                        : <Copy className="w-3.5 h-3.5 text-fg-3" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Name Comparison */}
            {(link_result?.cert_name || link_result?.page_name) && (
              <div>
                <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-wider mb-3">Name Comparison</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  {/* From cert */}
                  <div className="rounded-xl border border-border-light bg-bg-3 p-4 text-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-[10px] font-medium text-fg-3 uppercase tracking-wider mb-1">From Certificate</p>
                    <p className={`text-sm font-bold ${link_result?.cert_name ? 'text-fg' : 'text-fg-3 italic'}`}>
                      {link_result?.cert_name || 'Not detected'}
                    </p>
                  </div>

                  {/* Ring */}
                  <SafeRing score={matchScore} isVerified={isVerified} />

                  {/* From page */}
                  <div className="rounded-xl border border-border-light bg-bg-3 p-4 text-center">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto mb-2">
                      <Globe className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-[10px] font-medium text-fg-3 uppercase tracking-wider mb-1">From Web Page</p>
                    <p className={`text-sm font-bold ${link_result?.page_name ? 'text-fg' : 'text-fg-3 italic'}`}>
                      {link_result?.page_name || 'Not found'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error/warning */}
            {link_result?.error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">{link_result.error}</p>
              </div>
            )}

            {/* Extra URLs */}
            {Array.isArray(detected_urls) && detected_urls.length > 1 && (
              <div>
                <p className="text-[10px] font-semibold text-fg-3 uppercase tracking-wider mb-2">
                  All Detected URLs ({detected_urls.length})
                </p>
                <div className="rounded-xl border border-border-light bg-bg-3 p-3 space-y-1.5">
                  {detected_urls.map((url, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-fg-3 font-mono flex-shrink-0 w-4">{i + 1}.</span>
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="text-blue-400 font-mono break-all hover:underline">
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Try Again */}
        <div className="text-center">
          <button
            onClick={() => onReset ? onReset() : window.location.reload()}
            className="text-xs text-fg-3 hover:text-fg transition-colors underline underline-offset-2"
          >
            ← Verify another certificate
          </button>
        </div>
      </div>
    );
  } catch (err) {
    // Crash-proof fallback
    console.error('CertVerifyResult render error:', err);
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        Unable to display result. Check browser console for details.
      </div>
    );
  }
}
