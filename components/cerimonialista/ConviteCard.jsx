import React from 'react';
import Icon from '../ui/Icon';
import Button from '../ui/Button';

function formatarData(dataStr) {
  if (!dataStr) return null;
  const data = new Date(dataStr + 'T00:00:00');
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ConviteCard({ evento, onGerarLink }) {
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
          {evento.nome_evento || 'Evento sem nome'}
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
          Pendente
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {evento.data_evento && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="calendar" size={14} color="var(--color-text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {formatarData(evento.data_evento)}
            </span>
          </div>
        )}
        {evento.cidade && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Icon name="mapPin" size={14} color="var(--color-text-muted)" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {evento.cidade}
            </span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)' }}>
        <Button variant="primary" size="sm" fullWidth onClick={() => onGerarLink(evento)}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
            <Icon name="send" size={16} />
            Copiar link de convite
          </span>
        </Button>
      </div>
    </div>
  );
}
