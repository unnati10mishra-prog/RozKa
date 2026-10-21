import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'auth'>('landing');

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

  // If user is authenticated (online or offline), show Dashboard
  if (user) {
    return (
      <div className="app-viewport">
        <div className="phone-chassis dashboard-chassis">
          <Dashboard />
        </div>
      </div>
    );
  }

  // If user clicked Get Started, show the Auth screen (Image 1)
  if (currentView === 'auth') {
    return (
      <div className="app-viewport">
        <div className="phone-chassis">
          <AuthScreen onBack={() => setCurrentView('landing')} />
        </div>
      </div>
    );
  }

  // Default First Look (Image 2)
  return (
    <div className="app-viewport">
      <div className="phone-chassis">
        <div className="phone-screen">
          <div className="screen-content">
            {/* Header: Logo & Tagline */}
            <header className="header-section">
              <h1 className="brand-logo">
                <span className="logo-roz">Roz</span>
                <span className="logo-ka">Ka</span>
              </h1>
              <p className="brand-tagline">
                Roz ka hisaab. Business ka sukoon.
              </p>
            </header>

            {/* Middle Spacer */}
            <div className="store-hero-spacer" />

            {/* Lower Section: Handwritten Quote & CTA */}
            <footer className="footer-section">
              <div className="quote-container">
                <span className="quote-line">Badi soch</span>
                <span className="quote-line">har chhoti dukaan ke liye.</span>
              </div>

              <button
                type="button"
                className="cta-button"
                onClick={() => setCurrentView('auth')}
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
