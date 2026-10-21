import React from 'react';
import { ArrowLeft, Shield, Lock, Database, UserCheck, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="policy-page-container">
      <div className="policy-card">
        {/* Navigation / Header */}
        <div className="policy-header-bar">
          {onBack && (
            <button type="button" className="policy-back-btn" onClick={onBack}>
              <ArrowLeft size={18} />
              <span>Back to App</span>
            </button>
          )}
          <div className="policy-badge">
            <Shield size={16} color="#0E4334" />
            <span>Google API Compliance Verified</span>
          </div>
        </div>

        {/* Title */}
        <div className="policy-title-block">
          <h1 className="policy-h1">Privacy Policy for RozKa</h1>
          <p className="policy-meta">
            <strong>Domain:</strong> <a href="https://rozka.tech" target="_blank" rel="noreferrer">https://rozka.tech</a> &nbsp;|&nbsp;
            <strong>Effective Date:</strong> October 21, 2026 &nbsp;|&nbsp;
            <strong>Last Updated:</strong> October 21, 2026
          </p>
        </div>

        <div className="policy-body">
          {/* Section 1 */}
          <section className="policy-section">
            <h2>1. Introduction &amp; Who We Are</h2>
            <p>
              Welcome to <strong>RozKa</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), accessible via <strong>https://rozka.tech</strong>. 
              RozKa is an offline-first inventory management, daily sales recording, and smart supplier replenishment assistant designed specifically for neighbourhood retailers (kirana stores) across India.
            </p>
            <p>
              We are committed to absolute transparency regarding how your data is collected, stored, and utilized. If you have any privacy questions, contact our Data Protection team at: <strong>ankanb2006@gmail.com</strong> or <strong>privacy@rozka.tech</strong>.
            </p>
          </section>

          {/* Section 2: Google User Data */}
          <section className="policy-section highlight-box">
            <div className="section-icon-header">
              <UserCheck size={22} color="#0E4334" />
              <h2>2. Google API Services &amp; Google User Data Policy Compliance</h2>
            </div>
            <p>
              When you opt to sign in to RozKa using <strong>Google Sign-In</strong>, RozKa requests access to basic authentication profile scopes:
            </p>
            <ul>
              <li><code>openid</code> &mdash; To securely authenticate your identity.</li>
              <li><code>https://www.googleapis.com/auth/userinfo.email</code> &mdash; To identify your retailer store account and send critical account alerts.</li>
              <li><code>https://www.googleapis.com/auth/userinfo.profile</code> &mdash; To display your name and profile avatar on your store dashboard.</li>
            </ul>
            <div className="policy-alert-box">
              <CheckCircle2 size={20} color="#0E4334" />
              <div>
                <strong>Limited Use Requirements Compliance:</strong>
                <p>
                  RozKa&rsquo;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                  <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
                    Google API Services User Data Policy
                  </a>, including the Limited Use requirements.
                </p>
              </div>
            </div>
            <p>In strict compliance with Google&rsquo;s User Data Policy:</p>
            <ul>
              <li><strong>No Advertising:</strong> We never use or transfer Google user data to serve advertisements, personalized retargeting, or data brokers.</li>
              <li><strong>No Selling of Data:</strong> We never sell, rent, or lease your Google user data or retail inventory data to any third party.</li>
              <li><strong>No Model Training:</strong> We do not use Google user data to train or fine-tune generalized artificial intelligence or machine learning models.</li>
              <li><strong>Human Access Restrictions:</strong> No human reads your personal Google data unless you explicitly authorize us to resolve a technical error, it is necessary for security investigations, or it is required by law.</li>
            </ul>
          </section>

          {/* Section 3: Data We Collect */}
          <section className="policy-section">
            <div className="section-icon-header">
              <Database size={22} color="#0E4334" />
              <h2>3. Information We Collect</h2>
            </div>
            <p>RozKa collects only the minimum necessary information to operate your retail inventory:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, password hash (if registering via email), phone number (optional), and store/dukaan name.</li>
              <li><strong>Store &amp; Inventory Records:</strong> Product names, local barcodes, units of measurement (packets, kilograms, litres, pieces), current stock levels, low-stock threshold triggers, purchase cost, and selling price.</li>
              <li><strong>Daily Sales Data:</strong> Timestamped transaction records, quantities sold, payment mode (cash/UPI/credit), and receipt totals.</li>
              <li><strong>Supplier &amp; Reorder Notes:</strong> Supplier distributor contact name, lead times, and generated draft orders.</li>
              <li><strong>Device &amp; Connectivity Status:</strong> Online/offline network status to coordinate seamless local-first IndexedDB caching and cloud sync.</li>
            </ul>
          </section>

          {/* Section 4: Offline-First & Local Storage */}
          <section className="policy-section">
            <div className="section-icon-header">
              <Lock size={22} color="#0E4334" />
              <h2>4. Offline-First Architecture &amp; On-Device Storage</h2>
            </div>
            <p>
              RozKa is engineered as a <strong>Local-First Progressive Web Application</strong>. Your inventory records, sales transactions, and price logs are stored directly on your physical smartphone or computer using the browser&rsquo;s <strong>IndexedDB (Dexie.js)</strong> database.
            </p>
            <p>
              <strong>Airplane Mode Privacy:</strong> When your device is offline or in airplane mode, 100% of your business data remains exclusively inside your device storage. Zero bytes of data are broadcast across any network until internet connectivity is established.
            </p>
          </section>

          {/* Section 5: Cloud Backup & Security */}
          <section className="policy-section">
            <h2>5. Cloud Synchronization &amp; Data Security</h2>
            <p>
              For users who sign in with an account, RozKa provides optional automated cloud backup powered by <strong>Supabase (PostgreSQL)</strong>.
            </p>
            <ul>
              <li><strong>Encryption in Transit:</strong> All communications between your device and our cloud servers are encrypted using modern Transport Layer Security (TLS 1.3 / HTTPS).</li>
              <li><strong>Row Level Security (RLS):</strong> Our database strictly enforces PostgreSQL Row Level Security policies. Only your verified authenticated user ID can read or mutate your shop&rsquo;s inventory and sales records.</li>
              <li><strong>Offline Outbox Queue:</strong> Changes made while offline are cryptographically queued and synchronised only upon authenticated connection.</li>
            </ul>
          </section>

          {/* Section 6: AI Features & Groq/Gemini Integration */}
          <section className="policy-section">
            <h2>6. Artificial Intelligence &amp; Distributor Message Processing</h2>
            <p>
              RozKa includes optional features that parse distributor WhatsApp text messages (e.g. <em>&ldquo;Parle-G 20 packets, Maggi 10, oil 5 litre&rdquo;</em>) into structured draft orders.
            </p>
            <ul>
              <li>When online, this query is processed via secure API endpoints (Groq / Google Gemini) solely for parsing quantities and product names.</li>
              <li>No personal customer identifying information is passed to AI models.</li>
              <li>When in offline mode, RozKa uses a built-in deterministic local regex parser on-device with zero internet connection required.</li>
            </ul>
          </section>

          {/* Section 7: User Rights & Data Deletion */}
          <section className="policy-section">
            <h2>7. Your Rights: Data Access, Export, and Complete Deletion</h2>
            <p>As a retailer using RozKa, you have full ownership and sovereign control over your business data:</p>
            <ul>
              <li><strong>Right to Export:</strong> You can export your full product catalogue and sales records at any time.</li>
              <li><strong>Right to Erase / Account Deletion:</strong> You can delete all locally stored records simply by clearing your browser site data or clicking &ldquo;Clear Local Data&rdquo; in Settings.</li>
              <li><strong>Cloud Account Deletion:</strong> To completely delete your cloud account, Supabase auth profile, and all associated inventory data from our servers, send an email with the subject <em>&ldquo;Delete My Account&rdquo;</em> from your registered email address to <strong>ankanb2006@gmail.com</strong>. Your records will be purged within 48 business hours.</li>
            </ul>
          </section>

          {/* Section 8: Contact */}
          <section className="policy-section footer-contact-box">
            <h2>8. Contact Us &amp; Developer Information</h2>
            <p>If you have any questions, feedback, or concerns regarding this Privacy Policy or RozKa&rsquo;s security compliance, please contact:</p>
            <div className="contact-details">
              <p><strong>Application:</strong> RozKa (Roz ka hisaab. Business ka sukoon.)</p>
              <p><strong>Website:</strong> <a href="https://rozka.tech">https://rozka.tech</a></p>
              <p><strong>Lead Developer / Data Controller:</strong> Ankan (orsted10)</p>
              <p><strong>Email:</strong> <a href="mailto:ankanb2006@gmail.com">ankanb2006@gmail.com</a> / <a href="mailto:privacy@rozka.tech">privacy@rozka.tech</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
