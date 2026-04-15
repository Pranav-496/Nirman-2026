import { ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border-light py-8 mt-auto no-print">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold gradient-text">EduTrust</span>
            </div>
            <p className="text-xs text-fg-3 leading-relaxed">
              AI-Powered Certificate Verification System for educational institutions.
              Ensuring academic integrity through technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-fg-2 uppercase tracking-wider mb-3">Quick Links</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { to: '/', label: 'Verify Certificate' },
                { to: '/qr', label: 'QR Lookup' },
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/about', label: 'How It Works' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="text-xs text-fg-3 hover:text-primary transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-semibold text-fg-2 uppercase tracking-wider mb-3">Technology</h4>
            <div className="flex flex-wrap gap-1.5">
              {['FastAPI', 'React', 'OpenCV', 'Tesseract OCR', 'SHA-256'].map(tech => (
                <span key={tech} className="text-[10px] font-medium text-fg-3 bg-bg-3 px-2 py-1 rounded-md">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border-light pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-fg-3">
          <span>© 2026 EduTrust · AI-Powered Verification </span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-valid animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
