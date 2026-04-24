import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/client';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNativeRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { email, password, name });
      login(data.user, data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError('');
    try {
      if (!credentialResponse?.credential) {
        setError('Google did not return a valid credential. Please try again.');
        return;
      }
      const { data } = await api.post('/auth/google', { token: credentialResponse.credential });
      login(data.user, data.access_token);
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Google authentication failed. Please try email registration instead.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    console.error('Google Sign-up Error:', err);
    setError(
      'Google sign-up failed — localhost may not be registered as an authorized origin in Google Cloud Console. ' +
      'Please use email registration below, or add http://localhost:5173 to your OAuth Client ID\'s authorized origins.'
    );
  };

  const isLoading = loading || googleLoading;

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <div className="card w-full max-w-md p-8 relative overflow-hidden">
        {googleLoading && (
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-fg-2 font-medium">Creating your account...</p>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-fg">Create Account</h1>
          <p className="text-sm text-fg-3 mt-1">Get started with AuthentiFy verification</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-fake-muted border border-fake/20 text-fake text-sm flex items-start gap-2 animate-scale-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="rectangular"
            theme="filled_black"
            size="large"
            width="360"
            text="signup_with"
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-light"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-bg-2 px-3 text-fg-3 uppercase tracking-wider">Or register with email</span>
          </div>
        </div>

        <form onSubmit={handleNativeRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-fg-2 uppercase tracking-wide mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-bg-2 border border-border-light rounded-xl py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="Your Name"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-fg-2 uppercase tracking-wide mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-2 border border-border-light rounded-xl py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="admin@authentify.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-fg-2 uppercase tracking-wide mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-2 border border-border-light rounded-xl py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-3 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-fg-3 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-light transition-colors font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
