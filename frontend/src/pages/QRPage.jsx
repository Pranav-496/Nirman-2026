import { useState } from 'react';
import { QrCode, Loader2, ScanLine } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import ResultCard from '../components/ResultCard';
import api from '../api/client';

export default function QRPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleLookup = async (certId) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.get('/qr-verify', { params: { id: certId } });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Certificate not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/15 mb-4">
          <QrCode className="w-7 h-7 text-secondary" />
        </div>
        <h1 className="text-3xl font-bold gradient-text">QR Certificate Lookup</h1>
        <p className="text-fg-2 mt-2 text-sm max-w-md mx-auto">
          Enter the Certificate ID printed under the QR code to instantly verify it against our database.
        </p>
      </div>

      {/* Scanner / Input */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <QRScanner onSubmit={handleLookup} loading={loading} />
      </div>

      {/* Demo hint */}
      <div className="mt-4 text-center animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <p className="text-xs text-fg-3">
          <ScanLine className="w-3 h-3 inline mr-1" />
          Try: <code className="font-mono text-primary-light bg-primary-muted px-1.5 py-0.5 rounded text-[11px]">CERT-100001</code> or
          <code className="font-mono text-primary-light bg-primary-muted px-1.5 py-0.5 rounded text-[11px] ml-1">CERT-100029</code>
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-6 flex items-center justify-center gap-2 text-fg-2 text-sm animate-fade-in">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Looking up certificate...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-fake-muted border border-fake/20 text-fake text-sm text-center animate-scale-in">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-8">
          <ResultCard data={result} />
        </div>
      )}
    </div>
  );
}
