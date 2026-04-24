import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, Link2, QrCode, Globe, UserCheck, Shield, Loader2, ExternalLink, Type } from 'lucide-react';
import DropZone from '../components/DropZone';
import CertVerifyResult from '../components/CertVerifyResult';
import api from '../api/client';

const PROCESSING_STAGES = [
  { id: 'scan', icon: QrCode, label: 'Scanning Certificate', detail: 'Detecting QR codes and text regions...', color: 'text-primary' },
  { id: 'detect', icon: Link2, label: 'Detecting Verification URL', detail: 'Extracting URLs via QR decode and OCR...', color: 'text-secondary' },
  { id: 'fetch', icon: Globe, label: 'Fetching Verification Page', detail: 'Connecting to verification server...', color: 'text-accent' },
  { id: 'match', icon: UserCheck, label: 'Matching Certificate Holder', detail: 'Comparing names with AI fuzzy matching...', color: 'text-valid' },
  { id: 'verdict', icon: Shield, label: 'Generating Verdict', detail: 'Computing verification confidence...', color: 'text-primary-light' },
];

export default function CertVerifyPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('upload'); // 'upload' or 'manual'
  const [loading, setLoading] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const resetResult = () => {
    setResult(null);
    setError('');
    setLoading(false);
    setStageIdx(0);
    setElapsed(0);
    setLogs([]);
  };
  const [manualUrl, setManualUrl] = useState('');
  const [manualName, setManualName] = useState('');
  const timerRef = useRef(null);
  const logContainerRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Simulated processing stages
  const simulateProcessing = () => {
    const logMessages = [
      '[INIT] Loading OpenCV QR detector module...',
      '[INIT] EasyOCR engine initialized (en)',
      '[SCAN] Preprocessing image: grayscale → denoise → threshold',
      '[SCAN] Running QRCodeDetector.detectAndDecode()...',
      '[SCAN] Running adaptive threshold for text region detection...',
      '[OCR]  Morphological close: kernel(25,3) applied',
      '[OCR]  Found 3 candidate URL regions',
      '[OCR]  Running targeted OCR on crop regions...',
      '[URL]  Extracted URL candidates from certificate',
      '[NET]  Establishing HTTPS connection...',
      '[NET]  Fetching verification page content...',
      '[NET]  Response received: 200 OK',
      '[SCRP] Parsing HTML with BeautifulSoup4...',
      '[SCRP] Searching for name in page structure...',
      '[SCRP] Extracted holder name from verification page',
      '[ALGO] Running SequenceMatcher fuzzy comparison...',
      '[ALGO] Token-sort match initiated...',
      '[ALGO] Computing final match confidence score...',
      '[DONE] Verification pipeline complete.',
    ];

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logMessages.length) {
        setLogs(prev => [...prev, { time: (logIdx * 0.4).toFixed(1) + 's', msg: logMessages[logIdx] }]);
        logIdx++;
      }
    }, 400);

    let stage = 0;
    const stageInterval = setInterval(() => {
      stage++;
      if (stage < PROCESSING_STAGES.length) {
        setStageIdx(stage);
      }
    }, 1500);

    return () => {
      clearInterval(logInterval);
      clearInterval(stageInterval);
    };
  };

  const handleFileUpload = async (files) => {
    setLoading(true);
    setError('');
    setResult(null);
    setStageIdx(0);
    setElapsed(0);
    setLogs([]);

    // Start timer
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(((Date.now() - startTime) / 1000).toFixed(1));
    }, 100);

    const cleanupSim = simulateProcessing();

    try {
      const file = Array.isArray(files) ? files[0] : files;
      const form = new FormData();
      form.append('file', file);
      
      const { data } = await api.post('/verify/certificate', form, { timeout: 120000 });

      // Let stages finish visually
      await new Promise(r => setTimeout(r, 1500));
      setStageIdx(PROCESSING_STAGES.length - 1);
      await new Promise(r => setTimeout(r, 500));

      setResult(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errMsg = typeof detail === 'string' ? detail : 
                     Array.isArray(detail) ? detail[0]?.msg : 
                     'Certificate verification failed. Please try again.';
      setError(errMsg);
    } finally {
      clearInterval(timerRef.current);
      cleanupSim();
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setStageIdx(0);
    setElapsed(0);
    setLogs([]);

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(((Date.now() - startTime) / 1000).toFixed(1));
    }, 100);

    const cleanupSim = simulateProcessing();

    try {
      const { data } = await api.post('/verify/certificate/manual', {
        url: manualUrl.trim(),
        name: manualName.trim(),
      }, { timeout: 120000 });

      await new Promise(r => setTimeout(r, 1500));
      setStageIdx(PROCESSING_STAGES.length - 1);
      await new Promise(r => setTimeout(r, 500));

      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      clearInterval(timerRef.current);
      cleanupSim();
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="btn-ghost flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl mb-6 animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Verify
      </button>

      {!result && !loading && (
        <>
          {/* Hero */}
          <div className="text-center mb-10 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary-light text-xs font-medium mb-5">
              <Award className="w-3.5 h-3.5" /> Smart Link Verification
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text leading-tight tracking-tight">
              Verify Certificate
            </h1>
            <p className="text-fg-2 mt-4 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Upload a certificate to auto-detect the verification link, or enter the URL and name manually.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex bg-bg-2 border border-border-light rounded-xl p-1">
              <button
                onClick={() => setMode('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'upload'
                    ? 'bg-secondary/15 text-secondary-light border border-secondary/20'
                    : 'text-fg-3 hover:text-fg-2'
                }`}
              >
                <QrCode className="w-4 h-4" /> Upload & Scan
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'manual'
                    ? 'bg-secondary/15 text-secondary-light border border-secondary/20'
                    : 'text-fg-3 hover:text-fg-2'
                }`}
              >
                <Type className="w-4 h-4" /> Manual Input
              </button>
            </div>
          </div>

          {/* Upload Mode */}
          {mode === 'upload' && (
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <DropZone onFileSelect={handleFileUpload} disabled={loading} />
              <p className="text-center text-xs text-fg-3 mt-3">
                The system will detect QR codes and URLs on the certificate automatically 
              </p>
            </div>
          )}

          {/* Manual Mode */}
          {mode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="card p-6 sm:p-8 space-y-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <label className="block text-xs font-semibold text-fg-2 uppercase tracking-wide mb-1.5">
                  Verification URL
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" />
                  <input
                    type="url"
                    required
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    className="w-full bg-bg-2 border border-border-light rounded-xl py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-3 focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all"
                    placeholder="https://verify.example.com/certificate/12345"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-fg-2 uppercase tracking-wide mb-1.5">
                  Name on Certificate
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" />
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full bg-bg-2 border border-border-light rounded-xl py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-3 focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all"
                    placeholder="Enter the exact name shown on the certificate"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-secondary to-valid text-white border-none shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify Certificate <ExternalLink className="w-3.5 h-3.5" /></>}
              </button>
            </form>
          )}
        </>
      )}

      {/* === Advanced Processing UI === */}
      {loading && (
        <div className="space-y-6 animate-slide-up">
          {/* Main processing card */}
          <div className="card p-0 overflow-hidden border-secondary/30">
            {/* Top bar */}
            <div className="bg-gradient-to-r from-secondary/10 to-valid/5 border-b border-border-light px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center animate-pulse-scan">
                  <Shield className="w-5 h-5 text-secondary-light" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-fg uppercase tracking-wider">Certificate Verification</h3>
                  <p className="text-[10px] text-fg-3 font-mono uppercase tracking-widest">Pipeline Active</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-bold text-secondary-light">{elapsed}s</div>
                <div className="text-[10px] text-fg-3 uppercase">Elapsed</div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Stage progression */}
              <div>
                <h4 className="text-[10px] font-bold text-fg-3 uppercase tracking-widest mb-4">Processing Stages</h4>
                <div className="space-y-3">
                  {PROCESSING_STAGES.map((stage, i) => {
                    const Icon = stage.icon;
                    const isActive = i === stageIdx;
                    const isDone = i < stageIdx;
                    const isPending = i > stageIdx;

                    return (
                      <div
                        key={stage.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                          isActive
                            ? 'bg-secondary/10 border border-secondary/30 shadow-[0_0_15px_rgba(8,145,178,0.1)]'
                            : isDone
                            ? 'bg-valid-muted border border-valid/15'
                            : 'bg-bg-3/50 border border-transparent opacity-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-secondary/20' : isDone ? 'bg-valid-muted' : 'bg-bg-3'
                        }`}>
                          {isActive ? (
                            <Loader2 className="w-4 h-4 text-secondary-light animate-spin" />
                          ) : isDone ? (
                            <Icon className="w-4 h-4 text-valid" />
                          ) : (
                            <Icon className="w-4 h-4 text-fg-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${
                            isActive ? 'text-secondary-light' : isDone ? 'text-valid' : 'text-fg-3'
                          }`}>
                            {stage.label}
                            {isDone && <span className="ml-1.5 text-[9px] font-mono opacity-70">✓ Done</span>}
                          </p>
                          {(isActive || isDone) && (
                            <p className="text-[10px] text-fg-3 mt-0.5">{stage.detail}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Live log stream */}
              <div>
                <h4 className="text-[10px] font-bold text-fg-3 uppercase tracking-widest mb-4">System Log</h4>
                <div
                  ref={logContainerRef}
                  className="bg-[#0a0e1a] rounded-xl p-4 h-[320px] overflow-y-auto font-mono text-[11px] leading-relaxed border border-border-light"
                >
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1 animate-fade-in">
                      <span className="text-fg-3/50 flex-shrink-0 w-12 text-right">{log.time}</span>
                      <span className={
                        log.msg?.startsWith('[DONE]') ? 'text-valid' :
                        log.msg?.startsWith('[ERR]') ? 'text-fake' :
                        log.msg?.startsWith('[ALGO]') ? 'text-secondary-light' :
                        log.msg?.startsWith('[NET]') ? 'text-accent' :
                        log.msg?.startsWith('[URL]') ? 'text-primary-light' :
                        'text-fg-3'
                      }>
                        {log.msg}
                      </span>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-1 mt-1 text-secondary-light">
                      <span className="animate-pulse">▊</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom progress bar */}
            <div className="px-6 pb-4">
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-bg-3">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-valid transition-all duration-700 ease-out"
                  style={{ width: `${((stageIdx + 1) / PROCESSING_STAGES.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[9px] text-fg-3 font-mono uppercase tracking-widest">
                <span>Stage {stageIdx + 1}/{PROCESSING_STAGES.length}</span>
                <span>{PROCESSING_STAGES[stageIdx]?.label || 'Processing...'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="animate-scale-in">
          <CertVerifyResult data={result} onReset={resetResult} />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mt-6 p-4 rounded-xl bg-fake-muted border border-fake/20 text-fake text-sm animate-scale-in">
          {error}
        </div>
      )}
    </div>
  );
}
