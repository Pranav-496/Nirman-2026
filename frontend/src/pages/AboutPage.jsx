import { Link } from 'react-router-dom';
import {
  Info, Upload, ScanSearch, Hash, Brain, Database,
  CheckCircle, ArrowRight, ShieldCheck, Zap, Lock,
  FileText, HelpCircle, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

const pipeline = [
  {
    step: 1,
    icon: Upload,
    title: 'Upload Certificate',
    desc: 'Upload a certificate image (PNG, JPG, TIFF) or PDF. The file is sent securely to our backend for processing.',
    color: 'text-primary',
    bg: 'bg-primary-muted',
  },
  {
    step: 2,
    icon: ScanSearch,
    title: 'OCR Text Extraction',
    desc: 'Tesseract OCR (with EasyOCR fallback) extracts all visible text. Preprocessing with OpenCV improves accuracy on low-quality scans.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    step: 3,
    icon: FileText,
    title: 'Field Extraction',
    desc: 'Regex-based parser identifies Certificate ID, Student Name, Institution, Year, and Grade from the raw OCR text.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    step: 4,
    icon: Hash,
    title: 'SHA-256 Hash Verification',
    desc: 'A canonical hash is computed from extracted fields and compared against the pre-registered hash registry for integrity.',
    color: 'text-valid',
    bg: 'bg-valid-muted',
  },
  {
    step: 5,
    icon: Brain,
    title: 'AI Tampering Detection',
    desc: 'OpenCV heuristics analyze noise patterns, edge consistency, JPEG artifacts, and editing software metadata signatures.',
    color: 'text-fake',
    bg: 'bg-fake-muted',
  },
  {
    step: 6,
    icon: Database,
    title: 'Database Lookup',
    desc: 'Extracted certificate data is matched against the registered certificate database for record verification.',
    color: 'text-primary-light',
    bg: 'bg-primary-muted',
  },
  {
    step: 7,
    icon: CheckCircle,
    title: 'Scoring & Verdict',
    desc: 'Weighted scoring: DB Match (40%) + Hash Match (30%) + Tamper Clean (20%) + Field Completeness (10%). Verdict: VALID ≥ 75, SUSPICIOUS 40-74, FAKE < 40.',
    color: 'text-valid',
    bg: 'bg-valid-muted',
  },
];

const faqs = [
  {
    q: 'What file types are supported?',
    a: 'PNG, JPG, JPEG, BMP, TIFF, WebP images and PDF documents up to 10 MB.',
  },
  {
    q: 'How accurate is the OCR extraction?',
    a: 'We use Tesseract OCR with OpenCV preprocessing (grayscale, denoising, thresholding). EasyOCR serves as a fallback for challenging fonts. Accuracy is typically 90%+ on clean scans.',
  },
  {
    q: 'What does the tamper score mean?',
    a: 'It ranges from 0.0 (clean) to 1.0 (heavily tampered). Scores > 0.5 indicate potential editing via Photoshop, GIMP, or similar tools. The analysis checks noise patterns, edge consistency, JPEG block artifacts, and file metadata.',
  },
  {
    q: 'How is the confidence score calculated?',
    a: 'Score = DB Match × 40 + Hash Match × 30 + (1 – Tamper Score) × 20 + Field Completeness × 10. A score ≥ 75 is VALID, 40–74 is SUSPICIOUS, below 40 is FAKE.',
  },
  {
    q: 'Can I verify without uploading a file?',
    a: 'Yes! Use the "Quick Check" tab to manually enter the Certificate ID and Student Name. This skips OCR and tampering analysis but still checks the database and hash.',
  },
  {
    q: 'Is this using blockchain?',
    a: 'The current version uses blockchain-inspired SHA-256 hashing for integrity verification. The hash registry serves as an immutable reference similar to a blockchain ledger.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-light last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-medium text-fg group-hover:text-primary transition-colors pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-fg-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4 animate-slide-down">
          <p className="text-sm text-fg-2 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-12 animate-slide-up">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-muted border border-primary/15 mb-4">
          <Info className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">How AuthentiFy Works</h1>
        <p className="text-fg-2 max-w-xl mx-auto text-sm leading-relaxed">
          A 7-step AI-powered verification pipeline that combines OCR, cryptographic hashing,
          image forensics, and database matching to validate academic certificates.
        </p>
      </div>

      {/* Tech Stack Badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {[
          { icon: Zap, text: 'FastAPI' },
          { icon: ShieldCheck, text: 'React 19' },
          { icon: Brain, text: 'OpenCV' },
          { icon: ScanSearch, text: 'Tesseract' },
          { icon: Lock, text: 'SHA-256' },
          { icon: Hash, text: 'EasyOCR' },
        ].map(({ icon: I, text }) => (
          <span key={text} className="badge bg-bg-2 border border-border-light text-fg-2">
            <I className="w-3 h-3 text-primary/60" /> {text}
          </span>
        ))}
      </div>

      {/* Pipeline */}
      <div className="mb-12">
        <h2 className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-6 text-center">Verification Pipeline</h2>
        <div className="space-y-3">
          {pipeline.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="card p-5 flex items-start gap-4 animate-slide-up group hover:border-primary/20"
                style={{ animationDelay: `${0.1 + i * 0.06}s` }}
              >
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.bg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <span className="text-[10px] font-bold text-fg-3">STEP {step.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-fg mb-1">{step.title}</h3>
                  <p className="text-xs text-fg-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoring Formula */}
      <div className="card p-6 mb-12 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-4">Scoring Formula</h2>
        <div className="bg-bg-3 rounded-xl p-4 font-mono text-sm text-fg overflow-x-auto">
          <code>
            score = <span className="text-primary">db_match</span> × <span className="text-valid">40</span>
            {' + '}<span className="text-primary">hash_match</span> × <span className="text-valid">30</span>
            {' + (1 - '}<span className="text-primary">tamper</span>{') × '}<span className="text-valid">20</span>
            {' + '}<span className="text-primary">fields</span> × <span className="text-valid">10</span>
          </code>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-3 rounded-xl bg-valid-muted">
            <p className="text-lg font-bold text-valid">≥ 75</p>
            <p className="text-[10px] font-semibold text-fg-3 uppercase">VALID</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-suspicious-muted">
            <p className="text-lg font-bold text-suspicious">40–74</p>
            <p className="text-[10px] font-semibold text-fg-3 uppercase">SUSPICIOUS</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-fake-muted">
            <p className="text-lg font-bold text-fake">&lt; 40</p>
            <p className="text-[10px] font-semibold text-fg-3 uppercase">FAKE</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.55s' }}>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-fg">Frequently Asked Questions</h2>
        </div>
        <div className="card p-4 sm:p-6">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
        >
          <ShieldCheck className="w-4 h-4" />
          Verify a Certificate Now
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
