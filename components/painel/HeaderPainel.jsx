import { useMemo } from 'react';
import { useRouter } from 'next/router';
import Icon from '../ui/Icon';

function capitalizar(texto) {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

export default function HeaderPainel({ nomeCasal, dataEvento }) {
  const router = useRouter();
  const ehPaginaInicial = router.pathname === '/painel' || router.pathname === '/painel/index';

  const diasRestantes = useMemo(() => {
    if (!dataEvento) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const evento = new Date(dataEvento + 'T00:00:00');
    const diff = Math.ceil((evento - hoje) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [dataEvento]);

  const dataPorExtenso = useMemo(() => {
    if (!dataEvento) return '';
    const [ano, mes, dia] = dataEvento.split('-');
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} de ${ano}`;
  }, [dataEvento]);

  const nomeExibido = capitalizar(nomeCasal) || 'Seu Casamento';

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.brand}>
          {!ehPaginaInicial && (
            <button
              onClick={() => router.push('/painel')}
              style={styles.btnVoltar}
            >
              <Icon name="arrowLeft" size={14} color="var(--color-text-muted)" />
              <span>Voltar ao painel</span>
            </button>
          )}
          <h1 style={styles.title}>{nomeExibido}</h1>
          <div style={styles.meta}>
            {diasRestantes !== null && (
              <span style={styles.countdown}>
                Faltam {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}
              </span>
            )}
            {dataPorExtenso && (
              <span style={styles.dataExtenso}>{dataPorExtenso}</span>
            )}
            {!dataEvento && (
              <span style={styles.dataExtenso}>Data não definida</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: 'var(--color-off-white)',
    borderBottom: '1px solid var(--color-border)',
    padding: 'var(--space-5) 0',
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '0 var(--space-4)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  },
  btnVoltar: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
    padding: '0',
    fontFamily: 'var(--font-body)',
    marginBottom: '2px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    color: 'var(--color-brand)',
    margin: 0,
    lineHeight: 1.2,
    fontWeight: 'var(--font-normal)',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  countdown: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-brand)',
    fontWeight: 'var(--font-medium)',
  },
  dataExtenso: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  },
};