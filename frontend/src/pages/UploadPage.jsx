import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Keyboard, Loader2, Sparkles, Zap, Lock, ArrowRight } from 'lucide-react';
import DropZone from '../components/DropZone';
import api from '../api/client';

const STATUS_MESSAGES = [
  'Extracting text via OCR...',
  'Running AI anomaly detection...',
  'Computing SHA-256 hash...',
  'Checking database records...',
  'Generating confidence score...',
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('upload'); // 'upload' | 'manual'
  const [loading, setLoading] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [error, setError] = useState('');

  // --- Auto-cycle status messages during loading ---
  const startStatusCycle = () => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % STATUS_MESSAGES.length;
      setStatusIdx(i);
    }, 1500);
    return interval;
  };

  // --- File upload handler ---
  const handleFileUpload = async (file) => {
    setLoading(true);
    setError('');
    const interval = startStatusCycle();
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/verify', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/result', { state: { result: data } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  // --- Manual form handler ---
  const handleManual = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const interval = startStatusCycle();
    const fd = new FormData(e.target);
    try {
      const { data } = await api.post('/verify/manual', {
        cert_id: fd.get('cert_id'),
        name: fd.get('name'),
        institution: fd.get('institution') || undefined,
        year: fd.get('year') || undefined,
        grade: fd.get('grade') || undefined,
      });
      navigate('/result', { state: { result: data } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      {/* Hero */}
      <div className="text-center mb-10 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-muted border border-primary/15 text-primary-light text-xs font-medium mb-5">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Verification Engine
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold gradient-text leading-tight tracking-tight">
          Verify Any Certificate
        </h1>
        <p className="text-fg-2 mt-4 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          Upload a certificate image or PDF — our AI pipeline extracts data, checks integrity,
          and detects tampering in seconds.
        </p>
      </div>

      {/* Feature badges */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {[
          { icon: Zap, text: 'OCR Extraction' },
          { icon: Lock, text: 'SHA-256 Hashing' },
          { icon: ShieldCheck, text: 'Tamper Detection' },
        ].map(({ icon: I, text }) => (
          <span key={text} className="flex items-center gap-1.5 text-xs text-fg-2 bg-bg-2 border border-border-light px-3 py-1.5 rounded-full">
            <I className="w-3.5 h-3.5 text-primary/70" /> {text}
          </span>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center gap-2 mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        {[
          { key: 'upload', label: 'Upload File', icon: ShieldCheck },
          { key: 'manual', label: 'Quick Check', icon: Keyboard },
        ].map(({ key, label, icon: I }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === key
                ? 'bg-primary-muted text-primary-light border border-primary/20'
                : 'text-fg-3 hover:text-fg-2 border border-transparent hover:bg-hover'
            }`}
          >
            <I className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <DropZone onFileSelect={handleFileUpload} disabled={loading} />
        </div>
      )}

      {/* Manual tab */}
      {tab === 'manual' && (
        <form
          onSubmit={handleManual}
          className="card p-6 space-y-4 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'cert_id', label: 'Certificate ID *', placeholder: 'CERT-100001', required: true },
              { name: 'name', label: 'Student Name *', placeholder: 'Aarav Sharma', required: true },
              { name: 'institution', label: 'Institution', placeholder: 'IIT Delhi' },
              { name: 'year', label: 'Year', placeholder: '2024' },
              { name: 'grade', label: 'Grade', placeholder: 'A+' },
            ].map(({ name, label, placeholder, required }) => (
              <div key={name} className={name === 'institution' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-medium text-fg-3 mb-1.5">{label}</label>
                <input
                  name={name}
                  placeholder={placeholder}
                  required={required}
                  disabled={loading}
                  className="input-field w-full rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Verify Certificate
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="mt-6 card p-4 flex items-center gap-3 animate-slide-up">
          <div className="w-10 h-10 rounded-xl bg-primary-muted flex items-center justify-center flex-shrink-0">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-fg">{STATUS_MESSAGES[statusIdx]}</p>
            <div className="w-full h-1.5 mt-2 rounded-full overflow-hidden bg-bg-3">
              <div className="h-full bg-primary/40 animate-shimmer rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-fake-muted border border-fake/20 text-fake text-sm animate-scale-in">
          {error}
        </div>
      )}
    </div>
  );
}
