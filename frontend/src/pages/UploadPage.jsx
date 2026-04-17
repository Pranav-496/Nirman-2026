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
  const handleFileUpload = async (files) => {
    setLoading(true);
    setError('');
    const interval = startStatusCycle();
    try {
      const results = [];
      const filesArray = Array.isArray(files) ? files : [files];
      
      for (const file of filesArray) {
        const form = new FormData();
        form.append('file', file);
        const { data } = await api.post('/verify', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        results.push({ ...data, original_file: file.name });
      }
      
      if (results.length === 1) {
        navigate('/result', { state: { result: results[0] } });
      } else {
        navigate('/result', { state: { results: results } });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  // --- Removed Manual form handler ---

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

      {/* Dropzone is the only method now */}

      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <DropZone onFileSelect={handleFileUpload} disabled={loading} />
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="mt-8 card p-6 overflow-hidden relative animate-slide-up border-primary/30">
          <div className="absolute inset-0 bg-primary/5 animate-pulse-scan pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-primary/20 flex flex-col items-center justify-center flex-shrink-0 animate-pulse-scan">
              <Sparkles className="w-6 h-6 text-primary mb-1 animate-spin-slow" />
              <div className="text-[9px] font-mono text-primary font-bold uppercase tracking-widest">AI SCAN</div>
            </div>
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm font-semibold text-fg tracking-wide uppercase">
                  {STATUS_MESSAGES[statusIdx]}
                </p>
                <span className="text-xs font-mono text-primary font-bold">
                  {Math.round(((statusIdx + 1) / STATUS_MESSAGES.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-bg-3 relative">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out animate-progress-wipe"
                  style={{ width: `${((statusIdx + 1) / STATUS_MESSAGES.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 gap-2 text-[10px] uppercase tracking-wider text-fg-3/70 font-mono">
                <span>Init: Matrix_OK</span>
                <span>Sys_Thread: Validating</span>
              </div>
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
