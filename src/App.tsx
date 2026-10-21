import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { PublicLanding } from './components/PublicLanding';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [route, setRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('privacy') || path.endsWith('/privacy')) return 'privacy';
      if (hash.includes('terms') || path.endsWith('/terms')) return 'terms';
      if (hash.includes('auth') || hash.includes('login') || hash.includes('signup')) return 'auth';
      if (hash.includes('mobile-landing')) return 'mobile-landing';
    }
    return 'public';
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('privacy') || path.endsWith('/privacy')) {
        setRoute('privacy');
      } else if (hash.includes('terms') || path.endsWith('/terms')) {
        setRoute('terms');
      } else if (hash.includes('auth') || hash.includes('login') || hash.includes('signup')) {
        setRoute('auth');
      } else if (hash.includes('mobile-landing')) {
        setRoute('mobile-landing');
      } else if (hash.includes('app') || hash.includes('dashboard')) {
        setRoute('app');
      } else {
        setRoute('public');
      }
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (isLoading) {
    return (
      <div className="app-viewport">
        <div className="phone-chassis">
          <div className="phone-screen loading-screen">
            <div className="loading-spinner" />
            <p>RozKa Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // 1. Full Privacy Policy (Google OAuth Review Requirement)
  if (route === 'privacy') {
    return <PrivacyPolicy onBack={() => { window.location.hash = ''; setRoute('public'); }} />;
  }

  // 2. Full Terms of Service
  if (route === 'terms') {
    return <TermsOfService onBack={() => { window.location.hash = ''; setRoute('public'); }} />;
  }

  // 3. If user is authenticated, render the 8-Screen OMG Dashboard
  if (user) {
    return (
      <div className="app-viewport">
        <div className="phone-chassis dashboard-chassis">
          <Dashboard />
        </div>
      </div>
    );
  }

  // 4. Auth Screen (Sign In & Sign Up)
  if (route === 'auth') {
    return (
      <div className="app-viewport">
        <div className="phone-chassis">
          <AuthScreen
            onBack={() => { window.location.hash = ''; setRoute('public'); }}
            onSuccess={() => { window.location.hash = '#dashboard'; }}
          />
        </div>
      </div>
    );
  }

  // 5. Mobile Landing Screen (Screen 1 from mockup)
  if (route === 'mobile-landing') {
    return (
      <div className="app-viewport">
        <div className="phone-chassis">
          <div className="phone-screen">
            <div className="screen-content">
              <header className="header-section">
                <h1 className="brand-logo">
                  <span className="logo-roz">Roz</span>
                  <span className="logo-ka">Ka</span>
                </h1>
                <p className="brand-tagline">Roz ka hisaab. Business ka sukoon.</p>
              </header>

              <div className="store-hero-spacer" />

              <footer className="footer-section">
                <div className="quote-container">
                  <span className="quote-line">Badi soch</span>
                  <span className="quote-line">har chhoti dukaan ke liye.</span>
                </div>

                <button
                  type="button"
                  className="cta-button"
                  onClick={() => { window.location.hash = '#auth'; setRoute('auth'); }}
                  id="get-started-btn"
                >
                  <span>Get Started</span>
                  <ArrowRight size={20} className="cta-arrow" />
                </button>
              </footer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Public Home Page (Accessible without login for Google OAuth Verification Compliance)
  return (
    <PublicLanding
      onEnterApp={() => { window.location.hash = '#auth'; setRoute('auth'); }}
      onOpenPrivacy={() => { window.location.hash = '#privacy'; setRoute('privacy'); }}
      onOpenTerms={() => { window.location.hash = '#terms'; setRoute('terms'); }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
