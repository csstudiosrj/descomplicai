export default function VLibrasWidget() {
    const abrirVLibras = () => {
      const url = typeof window !== 'undefined'
        ? `https://vlibras.gov.br/app/?url=${encodeURIComponent(window.location.href)}`
        : 'https://vlibras.gov.br/app';
      window.open(url, '_blank', 'noopener,noreferrer');
    };
  
    return (
      <button
        onClick={abrirVLibras}
        aria-label="Abrir tradutor VLibras em nova aba"
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
    );
  }