import { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import { GoogleOAuthProvider } from '@react-oauth/google';
import Header from './components/Header';
import Footer from './components/Footer';
import UploadPage from './pages/UploadPage';
import MarksheetVerifyPage from './pages/MarksheetVerifyPage';
import CertVerifyPage from './pages/CertVerifyPage';
import ResultPage from './pages/ResultPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// ── Root Error Boundary — prevents full blank-screen crashes ──
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0C1222', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif',
          padding: '2rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
            style={{
              padding: '0.6rem 1.5rem', borderRadius: '0.75rem',
              background: 'linear-gradient(135deg,#6366f1,#0891b2)',
              color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600
            }}
          >
            ← Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


// Protected Route — requires authentication
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show a spinner instead of null — prevents blank flash during token validation
  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-sm text-fg-3">Checking session…</p>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <ErrorBoundary>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-bg text-fg">
              <Header />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* Protected Routes — require login */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <UploadPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/verify/marksheet" element={
                    <ProtectedRoute>
                      <MarksheetVerifyPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/verify/certificate" element={
                    <ProtectedRoute>
                      <CertVerifyPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/result" element={
                    <ProtectedRoute>
                      <ResultPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/history" element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
