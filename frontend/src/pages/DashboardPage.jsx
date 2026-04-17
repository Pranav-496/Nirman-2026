import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, ShieldCheck, ShieldAlert, ShieldX, Database,
  TrendingUp, ArrowRight, Activity
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import VerdictChart from '../components/VerdictChart';
import HistoryTable from '../components/HistoryTable';
import api from '../api/client';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats');
        setStats(data);
      } catch (err) {
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <Activity className="w-8 h-8 text-primary animate-pulse mx-auto mb-3" />
        <p className="text-fg-3 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <p className="text-fake text-sm">{error}</p>
        <p className="text-fg-3 text-xs mt-2">Make sure the backend server is running.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-muted flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-fg">Dashboard</h1>
            <p className="text-xs text-fg-3">Verification analytics and system overview</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatsCard
          icon={Database}
          label="Total Verifications"
          value={stats?.total_verifications || 0}
          color="text-primary"
          delay={0.05}
        />
        <StatsCard
          icon={ShieldCheck}
          label="Verified (Valid)"
          value={stats?.valid_count || 0}
          color="text-valid"
          delay={0.1}
        />
        <StatsCard
          icon={ShieldAlert}
          label="Suspicious"
          value={stats?.suspicious_count || 0}
          color="text-suspicious"
          delay={0.15}
        />
        <StatsCard
          icon={ShieldX}
          label="Invalid (Fake)"
          value={stats?.fake_count || 0}
          color="text-fake"
          delay={0.2}
        />
      </div>

      {/* Charts + Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <VerdictChart
            valid={stats?.valid_count || 0}
            suspicious={stats?.suspicious_count || 0}
            fake={stats?.fake_count || 0}
          />
        </div>

        <div className="card p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-4">System Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-2">Certificates in Database</span>
              <span className="text-sm font-bold text-fg">{stats?.total_certificates_in_db || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-2">Average Confidence</span>
              <span className="text-sm font-bold text-fg">{stats?.avg_score?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-2">Valid Rate</span>
              <span className="text-sm font-bold text-valid">{stats?.valid_pct?.toFixed(1) || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-2">Fraud Detection Rate</span>
              <span className="text-sm font-bold text-fake">{stats?.fake_pct?.toFixed(1) || 0}%</span>
            </div>
            <div className="border-t border-border-light pt-3 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-fg-3">
                <div className="w-1.5 h-1.5 rounded-full bg-valid animate-pulse" />
                All systems operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Verifications */}
      <div className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-fg-3 uppercase tracking-wider">Recent Verifications</h3>
          <Link to="/history" className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-light transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <HistoryTable entries={stats?.recent || []} compact />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-3 mt-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <Link to="/" className="card p-4 flex items-center gap-3 group hover:border-primary/30">
          <div className="w-10 h-10 rounded-xl bg-primary-muted flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-fg">Verify Certificate</p>
            <p className="text-xs text-fg-3">Upload or manually check a certificate</p>
          </div>
          <ArrowRight className="w-4 h-4 text-fg-3 group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </div>
  );
}
