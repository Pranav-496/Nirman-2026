import { useEffect, useState } from 'react';

export default function ConfidenceBar({ score, verdict }) {
  const [width, setWidth] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 150);
    return () => clearTimeout(t);
  }, [score]);

  // Animated counter
  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(eased * score);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const color =
    verdict === 'VALID'
      ? 'from-emerald-500 to-green-400'
      : verdict === 'SUSPICIOUS'
      ? 'from-amber-500 to-yellow-400'
      : 'from-red-500 to-rose-400';

  const glowClass =
    verdict === 'VALID'
      ? 'shadow-emerald-500/30'
      : verdict === 'SUSPICIOUS'
      ? 'shadow-amber-500/30'
      : 'shadow-red-500/30';

  const label =
    verdict === 'VALID'
      ? 'High Confidence'
      : verdict === 'SUSPICIOUS'
      ? 'Needs Review'
      : 'Low Confidence';

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-fg-2">Confidence Score</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            verdict === 'VALID' ? 'bg-valid-muted text-valid' :
            verdict === 'SUSPICIOUS' ? 'bg-suspicious-muted text-suspicious' :
            'bg-fake-muted text-fake'
          }`}>{label}</span>
        </div>
        <span className="text-2xl font-bold text-fg tabular-nums animate-count-up">
          {displayScore.toFixed(1)}%
        </span>
      </div>
      <div className="w-full h-3 bg-bg-3 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} shadow-lg ${glowClass} transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
      {/* Scale markers */}
      <div className="flex justify-between mt-1.5 text-[10px] text-fg-3">
        <span>0</span>
        <span className="text-fake">FAKE &lt;40</span>
        <span className="text-suspicious">SUSPICIOUS 40-74</span>
        <span className="text-valid">VALID ≥75</span>
        <span>100</span>
      </div>
    </div>
  );
}
