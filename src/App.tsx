import { PackageCheck, Sparkles, Store } from 'lucide-react';

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '520px',
        padding: '36px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 20px',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-500)'
        }}>
          <Store size={28} />
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px',
          letterSpacing: '-0.5px'
        }}>
          RozKa
        </h1>

        <p style={{
          fontSize: '15px',
          color: 'var(--primary-500)',
          fontWeight: 600,
          marginBottom: '16px',
          fontFamily: 'var(--font-hindi)'
        }}>
          रोज़ का हिसाब, बिज़नेस का सुकून
        </p>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '28px'
        }}>
          Everyday stock &amp; inventory management built for neighbourhood retailers.
          The project shell is initialized and ready for building.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          textAlign: 'left',
          background: 'var(--bg-surface-elevated)',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '13px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={16} color="var(--primary-500)" />
            <span>React + TypeScript + Vite configured</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={16} color="var(--primary-500)" />
            <span>PWA &amp; Offline manifest ready</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-amber)" />
            <span>Data models defined in <code>src/types/index.ts</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}
