import { AlertTriangle, WrenchIcon } from 'lucide-react';

export function ServiceAlert() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: 600,
        padding: '10px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        letterSpacing: '0.01em',
      }}
    >
      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
      <span>
        ⚠️ Services temporarily stopped due to technical issues. Our team is working to restore functionality. Please try again later.
      </span>
      <WrenchIcon size={16} style={{ flexShrink: 0 }} />
    </div>
  );
}

/** Reusable inline alert shown inside feature panels */
export function FeatureUnavailable({ featureName }: { featureName: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.12)',
          border: '2px solid rgba(239,68,68,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WrenchIcon size={32} color="#ef4444" />
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#ef4444' }}>
          Service Unavailable
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: '#888', maxWidth: 380 }}>
          <strong>{featureName}</strong> is currently unavailable due to technical issues.
          We apologize for the inconvenience and are working to restore this service as soon as possible.
        </p>
      </div>
      <div
        style={{
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 12,
          padding: '10px 18px',
          fontSize: '0.82rem',
          color: '#f59e0b',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <AlertTriangle size={14} />
        Service stopped — Please check back later
      </div>
    </div>
  );
}
