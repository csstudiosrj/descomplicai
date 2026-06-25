import React from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

function formatarData(dataStr) {
  if (!dataStr) return null;
  const data = new Date(dataStr + 'T00:00:00');
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatarValor(valor) {
  if (!valor) return null;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export default function ConviteCard({ lead, onGerarLink }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      {/* Topo: nome + badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            wordBreak: 'break-word',
            flex: 1,
          }}
        >
          {lead.nome_lead}
        </h3>
        <span
          style={{
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-medium)',
            whiteSpace: 'nowrap',
          }}
        >
          Contratado
        </span>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {lead.tipo_evento && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="tag" size={14} color="var(--color-text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {lead.tipo_evento}
            </span>
          </div>
        )}
        {lead.data_prevista && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="calendar" size={14} color="var(--color-text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {formatarData(lead.data_prevista)}
            </span>
          </div>
        )}
        {lead.valor_proposta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="dollar" size={14} color="var(--color-text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-medium)' }}>
              {formatarValor(lead.valor_proposta)}
            </span>
          </div>
        )}
        {lead.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="mail" size={14} color="var(--color-text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {lead.email}
            </span>
          </div>
        )}
      </div>

      {/* Ação */}
      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)' }}>
        <Button variant="primary" size="sm" fullWidth onClick={() => onGerarLink(lead)}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
            <Icon name="send" size={16} />
            Copiar link de convite
          </span>
        </Button>
      </div>
    </div>
  );
}
