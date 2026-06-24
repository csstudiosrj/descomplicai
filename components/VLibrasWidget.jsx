import { useState, useEffect } from 'react';

export default function VLibrasWidget() {
  const [aberto, setAberto] = useState(false);
  const [carregado, setCarregado] = useState(false);

  // Previne scroll quando painel está aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [aberto]);

  const url = typeof window !== 'undefined' 
    ? `https://vlibras.gov.br/app/?url=${encodeURIComponent(window.location.href)}`
    : 'https://vlibras.gov.br/app';

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(!aberto)}
        aria-label={aberto ? 'Fechar tradutor Libras' : 'Abrir tradutor Libras'}
        style={{
          position: 'fixed',
          right: '16px',
          bottom: '16px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#003366',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'transform 200ms ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      </button>

      {/* Painel com iframe */}
      {aberto && (
        <div
          style={{
            position: 'fixed',
            right: '16px',
            bottom: '88px',
            width: 'min(400px, calc(100vw - 32px))',
            height: '500px',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            zIndex: 9998,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Header do painel */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#003366',
              color: '#fff',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '14px' }}>VLibras — Tradutor</span>
            <button
              onClick={() => setAberto(false)}
              aria-label="Fechar"
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Iframe */}
          <iframe
            src={url}
            title="VLibras"
            style={{
              flex: 1,
              border: 'none',
              width: '100%',
            }}
            onLoad={() => setCarregado(true)}
          />

          {!carregado && (
            <div
              style={{
                position: 'absolute',
                inset: '44px 0 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontSize: '14px',
              }}
            >
              Carregando VLibras...
            </div>
          )}
        </div>
      )}

      {/* Overlay para fechar ao clicar fora */}
      {aberto && (
        <div
          onClick={() => setAberto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9997,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        />
      )}
    </>
  );
}