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
    const evento = new Date(dataEvento);
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
              <Icon name="arrowLeft" size={14} color="var(--color-text-soft)" />
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
    padding: '20px 0',
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
    gap: '6px',
  },
  btnVoltar: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: 'var(--color-text-soft)',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '0',
    fontFamily: 'var(--font-body)',
    marginBottom: '2px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    color: 'var(--color-primary)',
    margin: 0,
    lineHeight: 1.2,
    fontWeight: 600,
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  countdown: {
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    color: 'var(--color-brand)',
    fontWeight: 500,
  },
  dataExtenso: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    color: 'var(--color-text-soft)',
  },
};