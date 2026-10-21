import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="policy-page-container">
      <div className="policy-card">
        <div className="policy-header-bar">
          {onBack && (
            <button type="button" className="policy-back-btn" onClick={onBack}>
              <ArrowLeft size={18} />
              <span>Back to App</span>
            </button>
          )}
          <div className="policy-badge">
            <FileText size={16} color="#0E4334" />
            <span>RozKa Terms of Service</span>
          </div>
        </div>

        <div className="policy-title-block">
          <h1 className="policy-h1">Terms of Service for RozKa</h1>
          <p className="policy-meta">
            <strong>Domain:</strong> <a href="https://rozka.tech" target="_blank" rel="noreferrer">https://rozka.tech</a> &nbsp;|&nbsp;
            <strong>Effective Date:</strong> October 21, 2026
          </p>
        </div>

        <div className="policy-body">
          <section className="policy-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using RozKa (&ldquo;https://rozka.tech&rdquo;), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the application.
            </p>
          </section>

          <section className="policy-section">
            <h2>2. Purpose of Service</h2>
            <p>
              RozKa is an offline-first inventory management and sales logging tool built for neighbourhood retailers. It provides stock counts, sales tracking, reorder suggestions, and supplier order drafts.
            </p>
          </section>

          <section className="policy-section">
            <h2>3. Local-First Operation &amp; Data Responsibility</h2>
            <p>
              RozKa stores records locally using browser storage (IndexedDB). While cloud synchronization is supported via Supabase when online, users are advised to maintain periodic backups of critical shop operations. RozKa is not liable for data loss caused by clearing device browser caches or physical hardware damage.
            </p>
          </section>

          <section className="policy-section">
            <h2>4. Reorder Suggestions Disclaimer</h2>
            <p>
              RozKa&rsquo;s automated reorder suggestions and AI calculations are assistive estimates based on historical transaction velocity and user-entered lead times. They do not constitute guaranteed purchasing advice. The shopkeeper retains sole discretion and final authority over all supplier purchase orders.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. Contact Information</h2>
            <p>
              Questions regarding these Terms should be directed to <strong>ankanb2006@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
