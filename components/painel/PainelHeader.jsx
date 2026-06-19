import { useMemo } from 'react';

export default function HeaderPainel({ nomeCasal, dataEvento, onLogout }) {
  const diasRestantes = useMemo(() => {
    if (!dataEvento) return null;
    const hoje = new Date();
    const evento = new Date(dataEvento);
    const diff = Math.ceil((evento - hoje) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [dataEvento]);

  const dataFormatada = useMemo(() => {
    if (!dataEvento) return '';
    const [ano, mes, dia] = dataEvento.split('-');
    return `${dia}/${mes}/${ano}`;
  }, [dataEvento]);

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <h1 style={styles.title}>{nomeCasal || 'Seu Casamento'}</h1>
          <div style={styles.meta}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-soft)', flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span style={styles.metaText}>{dataFormatada}</span>
            {diasRestantes !== null && (
              <span style={styles.badge}>
                {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn} aria-label="Sair">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-soft)' }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: 'var(--color-fundo)',
    borderBottom: '1px solid var(--color-secondary)',
    padding: '16px 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    color: 'var(--color-primary)',
    margin: 0,
    lineHeight: 1.2,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--color-text-soft)',
  },
  metaText: {
    fontFamily: 'var(--font-body)',
  },
  badge: {
    background: 'var(--color-primary)',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 600,
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};