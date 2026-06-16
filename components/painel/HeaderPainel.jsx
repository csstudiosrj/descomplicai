// components/painel/HeaderPainel.jsx
import { useMemo } from 'react';
import Icon from '../ui/Icon';

export default function HeaderPainel({ nomeCasal, dataEvento }) {
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

  const temData = dataFormatada !== '';

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <h1 style={styles.title}>{nomeCasal || 'Seu Casamento'}</h1>
          <div style={styles.meta}>
            {temData ? (
              <>
                <Icon name="calendar" size={14} color="var(--color-text-soft)" />
                <span style={styles.metaText}>{dataFormatada}</span>
                {diasRestantes !== null && (
                  <span style={styles.badge}>
                    {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}
                  </span>
                )}
              </>
            ) : (
              <span style={styles.metaText}>Data do evento não definida</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: 'var(--color-fundo)',
    borderBottom: '1px solid var(--color-secondary)',
    padding: '16px 0',
    marginTop: '60px',
    zIndex: 100,
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '0 16px',
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
    minHeight: '20px',
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
};