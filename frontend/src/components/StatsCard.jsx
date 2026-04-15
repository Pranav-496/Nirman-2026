import { useEffect, useState } from 'react';

export default function StatsCard({ icon: Icon, label, value, suffix = '', color = 'text-primary', delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    const duration = 1000;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(eased * numValue);
      if (progress < 1) requestAnimationFrame(animate);
    };
    const t = setTimeout(() => requestAnimationFrame(animate), delay * 1000);
    return () => clearTimeout(t);
  }, [numValue, delay]);

  return (
    <div className="card p-5 animate-slide-up group hover:border-primary/30 transition-all duration-300" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-primary-muted group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-fg tabular-nums">
          {Number.isInteger(numValue) ? Math.round(displayValue) : displayValue.toFixed(1)}
          {suffix && <span className="text-lg text-fg-2 ml-0.5">{suffix}</span>}
        </p>
        <p className="text-xs font-medium text-fg-3 mt-1">{label}</p>
      </div>
    </div>
  );
}
