import { useEffect, useState } from 'react';

const ICONES = {
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  close: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

export default function ToastStatus({ toast, onUndo, onClose }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    setProgress(100);

    const duration = 3000;
    const start = Date.now();

    const anim = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed >= duration) {
        clearInterval(anim);
        setVisible(false);
        setTimeout(onClose, 300);
      }
    }, 50);

    return () => clearInterval(anim);
  }, [toast, onClose]);

  if (!toast || !visible) return null;

  const cores = {
    pendente: { bg: '#FFF8E1', border: '#F9A825', icon: 'clock', iconColor: '#F9A825' },
    confirmado: { bg: '#E8F5E9', border: '#10B981', icon: 'check', iconColor: '#10B981' },
    recusado: { bg: '#FFEBEE', border: '#C62828', icon: 'close', iconColor: '#C62828' },
  };

  const cfg = cores[toast.novoStatus] || cores.pendente;

  return (
    <div style={toastContainerStyle}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
      <div style={{
        ...toastCardStyle,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}>
        <div style={toastRowStyle}>
          <div style={{
            ...toastIconWrapStyle,
            background: cfg.iconColor,
          }}>
            {ICONES[cfg.icon]}
          </div>
          <div style={{ flex: 1 }}>
            <p style={toastTextStyle}>
              {toast.nome} — {toast.novoStatus === 'confirmado' ? 'confirmou presenca' : toast.novoStatus === 'recusado' ? 'recusou' : 'pendente'}
            </p>
          </div>
          <button
            onClick={() => { onUndo(); setVisible(false); }}
            style={{
              ...undoBtnStyle,
              color: cfg.iconColor,
            }}
          >
            Desfazer
          </button>
        </div>
        <div style={progressBarBgStyle}>
          <div style={{
            ...progressBarFillStyle,
            width: `${progress}%`,
            background: cfg.iconColor,
          }} />
        </div>
      </div>
    </div>
  );
}

/* ===== STYLES ===== */
const toastContainerStyle = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  zIndex: 999,
  animation: 'slideIn 0.3s ease',
};

const toastCardStyle = {
  borderRadius: '12px',
  padding: '14px 18px',
  minWidth: '280px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const toastRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const toastIconWrapStyle = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: 'pop 0.4s ease',
  color: '#fff',
  flexShrink: 0,
};

const toastTextStyle = {
  margin: 0,
  fontSize: '13px',
  fontWeight: 600,
  color: '#1A1714',
  fontFamily: 'var(--font-body)',
};

const undoBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  padding: '4px 8px',
  borderRadius: '6px',
  whiteSpace: 'nowrap',
};

const progressBarBgStyle = {
  width: '100%',
  height: '3px',
  background: 'rgba(0,0,0,0.08)',
  borderRadius: '2px',
  overflow: 'hidden',
};

const progressBarFillStyle = {
  height: '100%',
  borderRadius: '2px',
  transition: 'width 50ms linear',
};