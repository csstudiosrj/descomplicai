// Badge de status de fornecedor com ações rápidas
// Dependências diretas: React, PropTypes, Badge

import React from 'react';
import PropTypes from 'prop-types';
import Badge from '../ui/Badge';

const STATUS_LABELS = {
  orcamento: 'Orçamento',
  negociacao: 'Negociação',
  contratado: 'Contratado',
  cancelado: 'Cancelado',
};

const STATUS_VARIANTS = {
  orcamento: 'info',
  negociacao: 'warning',
  contratado: 'success',
  cancelado: 'danger',
};

export default function FornecedorStatus({ status, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
      <Badge variant={STATUS_VARIANTS[status] || 'default'} size="md" pill>{STATUS_LABELS[status] || status}</Badge>
      {onChange && (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onChange(key)}
              disabled={status === key}
              style={{
                padding: '2px var(--space-2)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: status === key ? 'var(--color-surface)' : 'var(--color-white)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: status === key ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                cursor: status === key ? 'default' : 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

FornecedorStatus.propTypes = {
  status: PropTypes.oneOf(['orcamento', 'negociacao', 'contratado', 'cancelado']).isRequired,
  onChange: PropTypes.func,
};

export { FornecedorStatus };