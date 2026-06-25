import React from 'react';
import Icon from '../ui/Icon';

function formatarValor(valor) {
  if (!valor) return null;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function formatarData(dataStr) {
  if (!dataStr) return null;
  const data = new Date(dataStr + 'T00:00:00');
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LeadCard({
  lead,
  estagios,
  isDragging,
  onDragStart,
  onDragEnd,
  onEditar,
  onMover,
  onExcluir,
}) {
  const estagioAtual = estagios.find((e) => e.id === lead.estagio);
  const estagioIndex = estagios.findIndex((e) => e.id === lead.estagio);
  const podeAvancar = estagioIndex < estagios.length - 1;
  const podeRetroceder = estagioIndex > 0;

  return (
    <div
      role="listitem"
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        border: '1px solid var(--color-border)',
        boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        opacity: isDragging ? 0.6 : 1,
        cursor: 'grab',
        transition: 'box-shadow var(--transition-fast), opacity var(--transition-fast), transform var(--transition-fast)',
        transform: isDragging ? 'rotate(2deg)' : 'none',
      }}
    >
      {/* Topo: nome + ações */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        <h4
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-snug)',
            flex: 1,
            wordBreak: 'break-word',
          }}
        >
          {lead.nome_lead}
        </h4>
        <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
          <button
            onClick={() => onEditar(lead)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label={`Editar lead ${lead.nome_lead}`}
            title="Editar"
          >
            <Icon name="edit" size={16} />
          </button>
          <button
            onClick={() => onExcluir(lead.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-danger)',
              padding: 'var(--space-1)',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label={`Excluir lead ${lead.nome_lead}`}
            title="Excluir"
          >
            <Icon name="trash" size={16} />
          </button>
        </div>
      </div>

      {/* Info do lead */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        {lead.tipo_evento && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="tag" size={14} color="var(--color-text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              {lead.tipo_evento}
            </span>
          </div>
        )}
        {lead.data_prevista && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="calendar" size={14} color="var(--color-text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              {formatarData(lead.data_prevista)}
            </span>
          </div>
        )}
        {lead.valor_proposta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="dollar" size={14} color="var(--color-text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-medium)' }}>
              {formatarValor(lead.valor_proposta)}
            </span>
          </div>
        )}
        {lead.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="mail" size={14} color="var(--color-text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              {lead.email}
            </span>
          </div>
        )}
        {lead.telefone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="phone" size={14} color="var(--color-text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              {lead.telefone}
            </span>
          </div>
        )}
      </div>

      {/* Badge de estágio + navegação mobile */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: estagioAtual?.bg || 'var(--color-off-white)',
            color: estagioAtual?.color || 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-medium)',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: estagioAtual?.color || 'var(--color-text-muted)',
            }}
          />
          {estagioAtual?.label || lead.estagio}
        </span>

        {/* Navegação por botões (mobile fallback) */}
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          {podeRetroceder && (
            <button
              onClick={() => onMover(lead.id, estagios[estagioIndex - 1].id)}
              style={{
                background: 'var(--color-off-white)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 'var(--space-1)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={`Mover para ${estagios[estagioIndex - 1].label}`}
              title={`Mover para ${estagios[estagioIndex - 1].label}`}
            >
              <Icon name="arrowLeft" size={14} />
            </button>
          )}
          {podeAvancar && (
            <button
              onClick={() => onMover(lead.id, estagios[estagioIndex + 1].id)}
              style={{
                background: 'var(--color-off-white)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 'var(--space-1)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={`Mover para ${estagios[estagioIndex + 1].label}`}
              title={`Mover para ${estagios[estagioIndex + 1].label}`}
            >
              <Icon name="arrowRight" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
