import React, { useState } from 'react';
import Icon from '../ui/Icon';

export default function RoteiroItem({ item, index, total, onEdit, onDelete, onStatusChange, onMoveUp, onMoveDown, readOnly }) {
  const [expanded, setExpanded] = useState(false);

  const statusLabels = {
    pendente: 'Pendente',
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    atrasado: 'Atrasado',
  };

  const statusStyles = {
    pendente: {
      background: 'var(--color-surface)',
      color: 'var(--color-text-muted)',
      border: '1px solid var(--color-border)',
    },
    em_andamento: {
      background: 'var(--color-brand-lighter)',
      color: 'var(--color-brand)',
      border: '1px solid var(--color-brand-light)',
    },
    concluido: {
      background: 'var(--color-success-light)',
      color: 'var(--color-success)',
      border: '1px solid var(--color-success)',
    },
    atrasado: {
      background: 'var(--color-danger-light)',
      color: 'var(--color-danger)',
      border: '1px solid var(--color-danger)',
    },
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: 'var(--space-4)',
        transition: 'box-shadow var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header: horário + título + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {/* Horário */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-brand)',
            backgroundColor: 'var(--color-brand-lighter)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            whiteSpace: 'nowrap',
            minWidth: '52px',
            textAlign: 'center',
          }}
        >
          {item.horario?.slice(0, 5)}
        </div>

        {/* Título e descrição */}
        <div style={{ flex: 1, minWidth: '140px' }}>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {item.titulo}
          </h3>
          {item.descricao && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                marginTop: 'var(--space-1)',
                lineHeight: 'var(--leading-snug)',
                display: expanded ? 'block' : '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.descricao}
            </p>
          )}
        </div>

        {/* Status badge */}
        <button
          onClick={() => !readOnly && onStatusChange && onStatusChange(item.id, nextStatus(item.status))}
          disabled={readOnly}
          style={{
            ...statusStyles[item.status],
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-medium)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--radius-full)',
            cursor: readOnly ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all var(--transition-fast)',
          }}
          aria-label={`Status: ${statusLabels[item.status]}. Clique para alterar.`}
        >
          {statusLabels[item.status]}
        </button>
      </div>

      {/* Responsável + Ações */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'var(--space-3)',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        {item.responsavel && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Icon name="user" size={12} />
            {item.responsavel}
          </div>
        )}

        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'auto' }}>
            {/* Expandir */}
            {item.descricao && item.descricao.length > 80 && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: 'var(--space-1)',
                }}
                aria-label={expanded ? 'Recolher detalhes' : 'Expandir detalhes'}
              >
                <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={16} />
              </button>
            )}

            {/* Mover para cima */}
            <button
              onClick={() => onMoveUp && onMoveUp(index)}
              disabled={index === 0}
              style={{
                background: 'none',
                border: 'none',
                cursor: index === 0 ? 'not-allowed' : 'pointer',
                color: index === 0 ? 'var(--color-border)' : 'var(--color-text-muted)',
                padding: 'var(--space-1)',
              }}
              aria-label="Mover para cima"
            >
              <Icon name="chevronUp" size={16} />
            </button>

            {/* Mover para baixo */}
            <button
              onClick={() => onMoveDown && onMoveDown(index)}
              disabled={index === total - 1}
              style={{
                background: 'none',
                border: 'none',
                cursor: index === total - 1 ? 'not-allowed' : 'pointer',
                color: index === total - 1 ? 'var(--color-border)' : 'var(--color-text-muted)',
                padding: 'var(--space-1)',
              }}
              aria-label="Mover para baixo"
            >
              <Icon name="chevronDown" size={16} />
            </button>

            {/* Editar */}
            <button
              onClick={() => onEdit && onEdit(item)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: 'var(--space-1)',
              }}
              aria-label="Editar item"
            >
              <Icon name="edit" size={16} />
            </button>

            {/* Deletar */}
            <button
              onClick={() => onDelete && onDelete(item.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-danger)',
                padding: 'var(--space-1)',
              }}
              aria-label="Excluir item"
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function nextStatus(current) {
  const cycle = ['pendente', 'em_andamento', 'concluido', 'atrasado'];
  const idx = cycle.indexOf(current);
  return cycle[(idx + 1) % cycle.length];
}
