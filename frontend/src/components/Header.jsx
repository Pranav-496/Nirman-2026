import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Upload, QrCode, LayoutDashboard, Clock, Info, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { to: '/', label: 'Verify', icon: Upload },
  { to: '/qr', label: 'QR Lookup', icon: QrCode },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/about', label: 'About', icon: Info },
];

export default function Header() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-border-light no-print">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold gradient-text tracking-tight leading-tight">EduTrust</span>
            <span className="text-[9px] font-medium text-fg-3 tracking-widest uppercase leading-none hidden sm:block">
              Certificate Verification
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary-muted text-primary-light'
                    : 'text-fg-2 hover:text-fg hover:bg-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
          <div className="w-px h-6 bg-border-light mx-2" />
          <ThemeToggle />
        </nav>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-hover transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5 text-fg-2" /> : <Menu className="w-5 h-5 text-fg-2" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border-light animate-slide-down">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary-muted text-primary-light'
                      : 'text-fg-2 hover:text-fg hover:bg-hover'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
