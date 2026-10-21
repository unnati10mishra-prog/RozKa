import React from 'react';
import { ArrowRight, WifiOff, Zap, ShieldCheck, Sparkles, ShoppingBag, BarChart3, Database, ExternalLink } from 'lucide-react';

interface PublicLandingProps {
  onEnterApp: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({ onEnterApp, onOpenPrivacy, onOpenTerms }) => {
  return (
    <div className="public-landing-container">
      {/* Top Navigation */}
      <nav className="public-nav">
        <div className="nav-brand">
          <span className="logo-roz">Roz</span>
          <span className="logo-ka">Ka</span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <button type="button" onClick={onOpenPrivacy} className="nav-link-btn">Privacy Policy</button>
          <button type="button" onClick={onOpenTerms} className="nav-link-btn">Terms</button>
          <button type="button" onClick={onEnterApp} className="nav-cta-btn">
            <span>Open App</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="public-hero">
        <div className="hero-pill">
          <span className="hero-pill-dot" />
          <span>Offline-First Indian Kirana Assistant</span>
        </div>

        <h1 className="hero-headline">
          Roz ka hisaab.<br />
          <span className="headline-highlight">Business ka sukoon.</span>
        </h1>

        <p className="hero-subhead">
          The smart inventory, fast sales recording, and supplier reorder assistant designed for neighbourhood retailers. 
          Works 100% offline in airplane mode with IndexedDB, and syncs safely to the cloud when connected.
        </p>

        <div className="hero-actions">
          <button type="button" className="hero-primary-btn" onClick={onEnterApp}>
            <span>Get Started / Sign In</span>
            <ArrowRight size={18} />
          </button>
          <button type="button" className="hero-secondary-btn" onClick={onOpenPrivacy}>
            <span>Read Privacy Policy</span>
            <ExternalLink size={16} />
          </button>
        </div>

        <div className="compliance-banner">
          <ShieldCheck size={18} color="#059669" />
          <span>Google API Services User Data Policy Compliant &bull; No Ads &bull; No Data Selling</span>
        </div>
      </header>

      {/* Feature Cards Grid */}
      <section id="features" className="public-features-section">
        <div className="section-header">
          <h2>Built for the way real shopkeepers work</h2>
          <p>No bloated enterprise software. Just clean, rapid actions at your fingertips.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon green">
              <WifiOff size={24} />
            </div>
            <h3>100% Offline-First</h3>
            <p>
              Operates completely without internet. Add products, record sales, and view stock even in airplane mode using local IndexedDB storage.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon amber">
              <Zap size={24} />
            </div>
            <h3>3-Tap Fast Counter Sales</h3>
            <p>
              Record customer sales faster than jotting them down in a notebook. Instant stock deduction and multi-item cart billing.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">
              <ShoppingBag size={24} />
            </div>
            <h3>Low Stock &amp; Dead Stock Alerts</h3>
            <p>
              Never lose customers to stockouts. Automatically flags products running below safety threshold and identifies slow-moving inventory.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">
              <Sparkles size={24} />
            </div>
            <h3>Smart AI Supplier Orders</h3>
            <p>
              Calculates daily sales velocity and supplier lead times to suggest exact reorder quantities. Powered by Groq, Gemini, and on-device NLP.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon emerald">
              <Database size={24} />
            </div>
            <h3>Encrypted Cloud Sync</h3>
            <p>
              Sign in with Google OAuth or email to back up your store to Supabase PostgreSQL with strict Row Level Security (RLS) data protection.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon rose">
              <BarChart3 size={24} />
            </div>
            <h3>Instant WhatsApp Orders</h3>
            <p>
              Turn order drafts into formatted Hindi/English distributor orders with one tap via WhatsApp or Web Share.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="public-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-brand">
              <span className="logo-roz">Roz</span>
              <span className="logo-ka">Ka</span>
            </div>
            <p className="footer-tagline">Har roz ka hisaab, aasan.</p>
            <p className="footer-copyright">&copy; {new Date().getFullYear()} RozKa Technologies. All rights reserved.</p>
          </div>

          <div className="footer-right">
            <div className="footer-col">
              <h4>Compliance &amp; Legal</h4>
              <button type="button" onClick={onOpenPrivacy} className="footer-link-btn">Privacy Policy</button>
              <button type="button" onClick={onOpenTerms} className="footer-link-btn">Terms of Service</button>
              <a href="https://support.google.com/cloud/answer/13806988" target="_blank" rel="noreferrer" className="footer-ext-link">
                Google OAuth Verification Info
              </a>
            </div>

            <div className="footer-col">
              <h4>Contact &amp; Support</h4>
              <p>Email: <a href="mailto:ankanb2006@gmail.com">ankanb2006@gmail.com</a></p>
              <p>Domain: <a href="https://rozka.tech">https://rozka.tech</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
