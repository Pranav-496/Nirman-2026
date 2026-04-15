import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const VERDICT_COLORS = {
  Valid: 'var(--et-valid)',
  Suspicious: 'var(--et-suspicious)',
  Invalid: 'var(--et-fake)',
};

export default function VerdictChart({ valid = 0, suspicious = 0, fake = 0 }) {
  const { theme } = useTheme();
  const total = valid + suspicious + fake;

  const data = [
    { name: 'Valid', value: valid },
    { name: 'Suspicious', value: suspicious },
    { name: 'Invalid', value: fake },
  ].filter(d => d.value > 0);

  if (total === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-fg-3">No data to display</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0];
      return (
        <div className="card px-3 py-2 shadow-lg">
          <p className="text-xs font-semibold text-fg">{d.name}</p>
          <p className="text-xs text-fg-2">{d.value} verifications ({((d.value / total) * 100).toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-5">
      <h3 className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-4">Verdict Distribution</h3>
      <div className="flex items-center gap-6">
        <div className="w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={62}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={VERDICT_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-2.5 flex-1">
          {[
            { name: 'Valid', value: valid, color: 'bg-valid' },
            { name: 'Suspicious', value: suspicious, color: 'bg-suspicious' },
            { name: 'Invalid', value: fake, color: 'bg-fake' },
          ].map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-xs font-medium text-fg-2">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-fg tabular-nums">{item.value}</span>
                <span className="text-[10px] text-fg-3 tabular-nums w-10 text-right">
                  {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
