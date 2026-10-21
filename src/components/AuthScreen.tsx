import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Store, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthScreenProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!identifier.trim() || !password) {
          setErrorMsg('Please enter your phone number or email and password.');
          setLoading(false);
          return;
        }

        const res = await signIn(identifier.trim(), password);
        if (!res.success) {
          setErrorMsg(res.error || 'Sign in failed');
        } else if (onSuccess) {
          onSuccess();
        }
      } else {
        if (!identifier.trim() || !password || !fullName.trim()) {
          setErrorMsg('Please fill in all required fields.');
          setLoading(false);
          return;
        }

        const email = identifier.includes('@') ? identifier.trim() : `${identifier.replace(/\D/g, '')}@rozka.tech`;
        const res = await signUp(
          email,
          password,
          fullName.trim(),
          shopName.trim() || `${fullName.trim()} Ki Dukan`,
          identifier.includes('@') ? '' : identifier.trim()
        );

        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed');
        } else if (onSuccess) {
          onSuccess();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setErrorMsg(null);
    const res = await signInWithGoogle();
    if (!res.success) {
      setErrorMsg(res.error || 'Google login failed');
    }
  };

  return (
    <div className="auth-screen-container">
      <div className="auth-content-body">
        {/* Brand Logo & Subtitle */}
        <div className="auth-brand">
          <h1 className="auth-brand-logo">
            <span className="logo-roz">Roz</span>
            <span className="logo-ka">Ka</span>
          </h1>
          <p className="auth-brand-tagline">Har roz ka hisaab, aasan.</p>
        </div>

        {/* Welcome Section */}
        <div className="auth-heading-block">
          <h2 className="auth-title">
            {mode === 'signin' ? 'Welcome to RozKa' : 'Create Shop Account'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'signin'
              ? 'Apna business sambhalna shuru karein.'
              : 'Apni dukaan register karein aur hisaab asaan banayein.'}
          </p>
        </div>

        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Shop Name</label>
                <div className="input-wrapper">
                  <Store size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Mishra Kirana Store"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Phone number or email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Enter your phone number or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="form-input"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-primary-btn" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleClick}
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Create an account / Switch to Sign In */}
        <button
          type="button"
          className="auth-secondary-btn"
          onClick={() => {
            setErrorMsg(null);
            setMode(mode === 'signin' ? 'signup' : 'signin');
          }}
        >
          <span>{mode === 'signin' ? 'Create an account' : 'Already have an account? Sign In'}</span>
          <ArrowRight size={15} />
        </button>

        <p className="auth-terms">
          By continuing, you agree to our <a href="#terms">Terms</a> &amp; <a href="#privacy">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};
