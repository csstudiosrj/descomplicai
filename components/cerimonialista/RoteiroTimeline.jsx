import React from 'react';
import Icon from '../ui/Icon';
import RoteiroItem from './RoteiroItem';

export default function RoteiroTimeline({ itens, onEdit, onDelete, onStatusChange, onMoveUp, onMoveDown, readOnly = false }) {
  if (!itens || itens.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-12) var(--space-5)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--color-border-strong)',
        }}
      >
        <Icon name="timeline" size={40} color="var(--color-text-muted)" />
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            marginTop: 'var(--space-4)',
          }}
        >
          Nenhum item no roteiro ainda.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-2)',
          }}
        >
          Gere automaticamente a partir do memorial ou adicione manualmente.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: 'var(--space-6)' }}>
      {/* Linha vertical da timeline */}
      <div
        style={{
          position: 'absolute',
          left: '18px',
          top: '0',
          bottom: '0',
          width: '2px',
          backgroundColor: 'var(--color-border-strong)',
          borderRadius: 'var(--radius-full)',
        }}
        aria-hidden="true"
      />

      {itens.map((item, index) => (
        <div key={item.id} style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
          {/* Bolinha da timeline */}
          <div
            style={{
              position: 'absolute',
              left: '-26px',
              top: '20px',
              width: '12px',
              height: '12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: statusColor(item.status),
              border: `2px solid var(--color-white)`,
              boxShadow: '0 0 0 2px var(--color-border-strong)',
              zIndex: 2,
            }}
            aria-hidden="true"
          />

          <RoteiroItem
            item={item}
            index={index}
            total={itens.length}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            readOnly={readOnly}
          />
        </div>
      ))}
    </div>
  );
}

function statusColor(status) {
  switch (status) {
    case 'concluido':
      return 'var(--color-success)';
    case 'em_andamento':
      return 'var(--color-brand)';
    case 'atrasado':
      return 'var(--color-danger)';
    default:
      return 'var(--color-text-muted)';
  }
}
