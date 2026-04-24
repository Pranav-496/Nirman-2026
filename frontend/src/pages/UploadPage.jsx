import { useNavigate } from 'react-router-dom';
import { FileText, Award, ShieldCheck, Zap, Lock, Brain, Database, Link2, QrCode, Search, ArrowRight, Sparkles } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
      {/* Hero */}
      <div className="text-center mb-12 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-muted border border-primary/15 text-primary-light text-xs font-medium mb-5">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Document Verification
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold gradient-text leading-tight tracking-tight">
          What would you like to verify?
        </h1>
        <p className="text-fg-2 mt-4 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
          Choose your verification mode below. Each uses a specialized AI pipeline tailored for the document type.
        </p>
      </div>

      {/* Two Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        
        {/* Card 1: Marksheet Verification */}
        <button
          onClick={() => navigate('/verify/marksheet')}
          className="card group relative p-0 overflow-hidden text-left hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] hover:scale-[1.02] cursor-pointer flex flex-col h-full"
        >
          {/* Gradient border top */}
          <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
          
          <div className="p-6 sm:p-8 flex-1 flex flex-col">
            {/* Icon + Badge */}
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300">
                <FileText className="w-7 h-7 text-primary-light" />
              </div>
              <span className="text-[10px] font-bold text-fg-3 uppercase tracking-widest bg-bg-3 px-2.5 py-1 rounded-full">
                4-Layer AI
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-fg mb-2 group-hover:text-primary-light transition-colors">
              Verify Marksheet
            </h2>
            <p className="text-sm text-fg-2 leading-relaxed mb-6">
              Upload a marksheet image or PDF. Our 4-layer AI pipeline extracts data, verifies hash integrity, detects tampering, and cross-checks the database.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: Zap, text: 'OCR Extract' },
                { icon: Lock, text: 'SHA-256' },
                { icon: Brain, text: 'AI Tamper' },
                { icon: Database, text: 'DB Match' },
              ].map(({ icon: I, text }) => (
                <span key={text} className="flex items-center gap-1 text-[10px] text-fg-3 bg-bg-3 border border-border-light px-2 py-1 rounded-full">
                  <I className="w-3 h-3 text-primary/60" /> {text}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
              Upload Marksheet <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </button>

        {/* Card 2: Certificate Verification */}
        <button
          onClick={() => navigate('/verify/certificate')}
          className="card group relative p-0 overflow-hidden text-left hover:border-secondary/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(8,145,178,0.15)] hover:scale-[1.02] cursor-pointer flex flex-col h-full"
        >
          {/* Gradient border top */}
          <div className="h-1 bg-gradient-to-r from-secondary via-valid to-secondary" />
          
          <div className="p-6 sm:p-8 flex-1 flex flex-col">
            {/* Icon + Badge */}
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-valid/10 flex items-center justify-center border border-secondary/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all duration-300">
                <Award className="w-7 h-7 text-secondary-light" />
              </div>
              <span className="text-[10px] font-bold text-fg-3 uppercase tracking-widest bg-bg-3 px-2.5 py-1 rounded-full">
                Link Verify
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-fg mb-2 group-hover:text-secondary-light transition-colors">
              Verify Certificate
            </h2>
            <p className="text-sm text-fg-2 leading-relaxed mb-6">
              Upload a certificate to auto-detect the verification URL (via QR code or OCR), then fetch and verify the certificate holder's name online.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { icon: QrCode, text: 'QR Detect' },
                { icon: Search, text: 'URL Scrape' },
                { icon: Link2, text: 'Link Verify' },
                { icon: ShieldCheck, text: 'Name Match' },
              ].map(({ icon: I, text }) => (
                <span key={text} className="flex items-center gap-1 text-[10px] text-fg-3 bg-bg-3 border border-border-light px-2 py-1 rounded-full">
                  <I className="w-3 h-3 text-secondary/60" /> {text}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-secondary group-hover:gap-3 transition-all">
              Upload Certificate <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </button>
      </div>

      {/* Bottom info row */}
      <div className="mt-10 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-center gap-2 text-xs text-fg-3">
          <div className="w-1.5 h-1.5 rounded-full bg-valid animate-pulse" />
          All verification is processed locally — your documents are never stored
        </div>
      </div>
    </div>
  );
}
