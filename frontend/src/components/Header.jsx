import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, LayoutDashboard, Clock, Info, Menu, X, LogOut, LogIn, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Dynamic Navigation Items
  const navItems = [
    ...(user ? [
      { to: '/', label: 'Verify', icon: ShieldCheck },
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/history', label: 'History', icon: Clock },
    ] : []),
    { to: '/about', label: 'About', icon: Info },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-border-light no-print">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? '/' : '/login'} className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold gradient-text tracking-tight leading-tight">AuthentiFy</span>
            <span className="text-[9px] font-medium text-fg-3 tracking-widest uppercase leading-none hidden sm:block">
              Document Verification
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to === '/' && pathname?.startsWith('/verify'));
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
          
          {user ? (
            <div className="relative flex items-center ml-2">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  profileOpen 
                    ? 'bg-primary-muted border-primary/30 text-primary-light' 
                    : 'bg-bg-2 border-border-light text-fg-2 hover:bg-hover'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                {user.name.split(' ')[0]}
              </button>

              {profileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setProfileOpen(false)}
                  ></div>
                  <div className="absolute top-full right-0 mt-2 w-64 bg-bg glass rounded-xl border border-border-light shadow-2xl z-50 overflow-hidden animate-slide-down">
                    <div className="p-4 border-b border-border-light bg-bg-2/50 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-fg truncate">{user.name}</span>
                          <span className="text-xs text-fg-3 truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-fake hover:bg-fake-muted transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 ml-2 rounded-lg text-sm font-medium btn-primary">
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          )}

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
              const active = pathname === to || (to === '/' && pathname?.startsWith('/verify'));
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
            
            <div className="h-px w-full bg-border-light my-2" />
            
            {user ? (
               <div className="py-2">
                 <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-bg-2/50 border border-border-light mb-2">
                   <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                     <User className="w-5 h-5 text-primary" />
                   </div>
                   <div className="flex flex-col min-w-0">
                     <span className="text-sm font-bold text-fg truncate">{user.name}</span>
                     <span className="text-xs text-fg-3 truncate">{user.email}</span>
                   </div>
                 </div>
                 <button onClick={handleLogout} className="flex items-center w-full text-left gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-fake hover:bg-fake-muted transition-colors">
                   <LogOut className="w-4 h-4" />
                   Logout
                 </button>
               </div>
            ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-primary hover:bg-primary-muted transition-colors">
                   <LogIn className="w-4 h-4" />
                   Login
                </Link>
            )}
            
          </nav>
        </div>
      )}
    </header>
  );
}
