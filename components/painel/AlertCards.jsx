import Icon from '../ui/Icon';

export default function AlertCards({ alertas = [] }) {
  if (alertas.length === 0) {
    return (
      <div style={styles.empty}>
        <Icon name="checkCircle" size={32} color="var(--color-success)" />
        <p style={styles.emptyText}>Tudo em ordem! Nenhum alerta no momento.</p>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {alertas.map((a, i) => (
        <button
          key={i}
          onClick={() => a.onClick?.()}
          style={{ ...styles.card, borderLeftColor: a.cor }}
        >
          <div style={{ ...styles.alertaIcone, background: a.cor }}>
            <Icon name={a.icone} size={16} color="var(--color-white)" />
          </div>
          <div style={styles.alertaTexto}>
            <span style={styles.alertaTitulo}>{a.titulo}</span>
            <span style={styles.alertaDescricao}>{a.descricao}</span>
          </div>
          <Icon name="arrowRight" size={16} color="var(--color-text-muted)" />
        </button>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    background: 'var(--color-white)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-3) var(--space-4)',
    border: '1px solid var(--color-border)',
    borderLeftWidth: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'box-shadow var(--transition-fast)',
  },
  alertaIcone: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertaTexto: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  alertaTitulo: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-semibold)',
    color: 'var(--color-text-primary)',
  },
  alertaDescricao: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-xs)',
    color: 'var(--color-text-muted)',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-10) var(--space-4)',
    background: 'var(--color-white)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
  },
  emptyText: {
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    textAlign: 'center',
  },
};