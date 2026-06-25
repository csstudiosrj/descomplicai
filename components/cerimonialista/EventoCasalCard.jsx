import React from 'react';
import Icon from '../ui/Icon';

export default function EventoCasalCard({ evento, naoLidas = 0, onClick }) {
  const formatarData = (dataStr) => {
    if (!dataStr) return 'Data não definida';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const calcularDiasRestantes = (dataStr) => {
    if (!dataStr) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataEvento = new Date(dataStr + 'T00:00:00');
    return Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24));
  };

  const dias = calcularDiasRestantes(evento.data_evento);

  return (
    <div
      style={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div style={styles.header}>
        <div style={styles.icone}>
          <Icon name="calendar" size={20} color="var(--color-brand)" />
        </div>
        <div style={styles.info}>
          <h3 style={styles.titulo}>{evento.nome_evento || 'Evento sem nome'}</h3>
          <p style={styles.data}>{formatarData(evento.data_evento)}</p>
        </div>
        {naoLidas > 0 && (
          <span style={styles.badge} aria-label={`${naoLidas} mensagens não lidas`}>
            {naoLidas > 99 ? '99+' : naoLidas}
          </span>
        )}
      </div>

      <div style={styles.body}>
        {dias !== null && (
          <div style={styles.diasBadge(dias)}>
            <Icon name="clock" size={14} />
            <span>
              {dias < 0
                ? `Realizado há ${Math.abs(dias)} dias`
                : dias === 0
                ? 'Hoje é o grande dia'
                : `${dias} dias restantes`}
            </span>
          </div>
        )}
        <div style={styles.meta}>
          <span style={styles.metaItem}>
            <Icon name="dollar" size={14} color="var(--color-text-muted)" />
            {evento.orcamento
              ? `R$ ${Number(evento.orcamento).toLocaleString('pt-BR')}`
              : 'Orçamento não definido'}
          </span>
          {evento.memorial_concluido && (
            <span style={styles.metaItem}>
              <Icon name="memorial" size={14} color="var(--color-success)" />
              Memorial completo
            </span>
          )}
        </div>
      </div>

      <div style={styles.footer}>
        <span style={styles.verMais}>
          <Icon name="arrowRight" size={14} />
          Acessar painel espelhado
        </span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    transition: 'box-shadow 200ms ease, transform 100ms ease',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-4)',
    borderBottom: '1px solid var(--color-border-light)',
  },
  icone: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-brand-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0 },
  titulo: {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-base)',
    color: 'var(--color-text-primary)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  data: {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
    margin: '2px 0 0',
  },
  badge: {
    background: 'var(--color-danger)',
    color: 'var(--color-white)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-bold)',
    minWidth: '20px',
    height: '20px',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 6px',
    flexShrink: 0,
  },
  body: {
    padding: 'var(--space-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  diasBadge: (dias) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-full)',
    backgroundColor: dias < 0 ? 'var(--color-text-muted-light)' : dias <= 30 ? 'var(--color-danger-light)' : 'var(--color-success-light)',
    color: dias < 0 ? 'var(--color-text-muted)' : dias <= 30 ? 'var(--color-danger)' : 'var(--color-success)',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    alignSelf: 'flex-start',
  }),
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-3)',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-muted)',
  },
  footer: {
    padding: 'var(--space-3) var(--space-4)',
    borderTop: '1px solid var(--color-border-light)',
    backgroundColor: 'var(--color-off-white)',
  },
  verMais: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-brand)',
    fontWeight: 'var(--font-semibold)',
  },
};
