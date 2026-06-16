// components/painel/AlertCards.jsx — Cards de alerta
import Icon from '../ui/Icon';

export default function AlertCards({ pagamentos = [], tarefas = [] }) {
  const pagamentosUrgentes = pagamentos.filter(p => p.dias <= 7 && p.dias >= 0);
  const tarefasAtrasadas = tarefas.filter(t => t.atrasada);

  if (pagamentosUrgentes.length === 0 && tarefasAtrasadas.length === 0) {
    return (
      <div style={styles.empty}>
        <Icon name="check" size={32} color="var(--color-primary)" />
        <p style={styles.emptyText}>Tudo em ordem! Nenhum alerta no momento.</p>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {pagamentosUrgentes.length > 0 && (
        <div style={{ ...styles.card, ...styles.cardAlert }}>
          <div style={styles.cardHeader}>
            <Icon name="dollar" size={18} color="#C62828" />
            <span style={styles.cardTitle}>Pagamentos em 7 dias</span>
          </div>
          <ul style={styles.list}>
            {pagamentosUrgentes.map((p, i) => (
              <li key={i} style={styles.item}>
                <span style={styles.itemName}>{p.nome}</span>
                <span style={styles.itemValue}>R$ {p.valor.toLocaleString('pt-BR')}</span>
                <span style={styles.itemBadge}>{p.dias}d</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tarefasAtrasadas.length > 0 && (
        <div style={{ ...styles.card, ...styles.cardWarning }}>
          <div style={styles.cardHeader}>
            <Icon name="alert" size={18} color="#F9A825" />
            <span style={styles.cardTitle}>Tarefas atrasadas</span>
          </div>
          <ul style={styles.list}>
            {tarefasAtrasadas.map((t, i) => (
              <li key={i} style={styles.item}>
                <span style={styles.itemName}>{t.titulo}</span>
                <span style={styles.itemBadgeWarning}>Atrasada</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid var(--color-secondary)',
  },
  cardAlert: {
    borderLeft: '4px solid #C62828',
  },
  cardWarning: {
    borderLeft: '4px solid #F9A825',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    padding: '8px 0',
    borderBottom: '1px solid var(--color-secondary)',
  },
  itemName: {
    flex: 1,
    color: 'var(--color-text)',
  },
  itemValue: {
    color: 'var(--color-text-soft)',
    fontWeight: 500,
  },
  itemBadge: {
    background: '#C62828',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 600,
  },
  itemBadgeWarning: {
    background: '#F9A825',
    color: '#1A1714',
    padding: '2px 8px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 600,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '32px 16px',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid var(--color-secondary)',
  },
  emptyText: {
    fontSize: '14px',
    color: 'var(--color-text-soft)',
    textAlign: 'center',
  },
};
