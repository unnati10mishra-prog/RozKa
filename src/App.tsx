import { useState } from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [started, setStarted] = useState(false);

  const handleGetStarted = () => {
    setStarted(true);
  };

  return (
    <div className="app-viewport">
      {/* Phone container mockup on desktop, native fullscreen on mobile */}
      <div className="phone-chassis">
        <div className="phone-screen">
          {/* Main Content Overlay */}
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

            {/* Middle Spacer ensuring store image remains in hero focus */}
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
                onClick={handleGetStarted}
                id="get-started-btn"
              >
                <span>Get Started</span>
                <ArrowRight size={20} className="cta-arrow" />
              </button>
            </footer>
          </div>

          {/* Optional modal when clicking Get Started */}
          {started && (
            <div className="welcome-modal-overlay">
              <div className="welcome-modal-card fade-in">
                <div className="modal-badge">
                  <Sparkles size={18} />
                  <span>RozKa Store Engine</span>
                </div>
                <h2>Aapka Swagat Hai!</h2>
                <p>Welcome to RozKa — offline-first inventory &amp; billing for smart retailers.</p>
                <div className="modal-features">
                  <div className="feature-item">
                    <CheckCircle2 size={16} color="#0E4334" />
                    <span>Works 100% Offline with IndexedDB</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle2 size={16} color="#0E4334" />
                    <span>Quick Sales &amp; Stock Deduction</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle2 size={16} color="#0E4334" />
                    <span>Smart Reorder &amp; Supplier Lists</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setStarted(false)}
                >
                  Theek Hai / Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
