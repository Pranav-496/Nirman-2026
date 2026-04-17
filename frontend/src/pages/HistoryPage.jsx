import { useState, useEffect } from 'react';
import { Clock, Filter, Download, RefreshCw } from 'lucide-react';
import HistoryTable from '../components/HistoryTable';
import api from '../api/client';

export default function HistoryPage() {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/history', { params: { limit: 100 } });
      setEntries(data);
    } catch (err) {
      setError('Unable to load history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = entries;
    if (filter !== 'ALL') {
      result = result.filter(e => e.verdict === filter);
    }
    if (search.trim()) {
      const q = search.trim().toUpperCase();
      result = result.filter(e => (e.cert_id || '').toUpperCase().includes(q));
    }
    setFiltered(result);
  }, [entries, filter, search]);

  const exportCSV = () => {
    const rows = [['Timestamp', 'Certificate ID', 'Verdict', 'Score']];
    filtered.forEach(e => {
      rows.push([e.timestamp, e.cert_id || '', e.verdict, e.score?.toString() || '']);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `authentify-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-muted flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-fg">Verification History</h1>
            <p className="text-xs text-fg-3">{entries.length} records · Audit log of all verification attempts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHistory}
            className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="btn-ghost px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Certificate ID..."
            className="input-field w-full rounded-xl pl-4 pr-10 py-2.5 text-sm"
          />
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" />
        </div>

        {/* Verdict filter */}
        <div className="flex gap-1.5">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'VALID', label: 'Valid' },
            { key: 'SUSPICIOUS', label: 'Suspicious' },
            { key: 'FAKE', label: 'Invalid' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === key
                  ? 'bg-primary-muted text-primary-light border border-primary/20'
                  : 'text-fg-3 border border-border-light hover:bg-hover hover:text-fg-2'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {search || filter !== 'ALL' ? (
        <p className="text-xs text-fg-3 mb-3 animate-fade-in">
          Showing {filtered.length} of {entries.length} records
        </p>
      ) : null}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-fake-muted border border-fake/20 text-fake text-sm mb-4">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <HistoryTable entries={filtered} />
      </div>
    </div>
  );
}
