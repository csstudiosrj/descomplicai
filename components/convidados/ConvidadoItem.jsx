// Item de convidado — card com status de confirmação, mesa e contato
// Dependências diretas: React, PropTypes, Card, Badge

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const STATUS_VARIANTS = {
  confirmado: 'success',
  pendente: 'warning',
  recusado: 'danger',
};

export default function ConvidadoItem({ convidado, onToggleStatus, onClick }) {
  const { nome, email, telefone, status, mesa, acompanhantes } = convidado;

  return (
    <Card variant="default" padding="md" interactive={!!onClick} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>{nome}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {email && <span>{email}</span>}
            {telefone && <span>{email ? ' · ' : ''}{telefone}</span>}
          </div>
          {(mesa || (acompanhantes && acompanhantes > 0)) && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
              {mesa && `Mesa ${mesa}`}
              {acompanhantes > 0 && `${mesa ? ' · ' : ''}+${acompanhantes} acompanhante${acompanhantes > 1 ? 's' : ''}`}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Badge variant={STATUS_VARIANTS[status] || 'default'} size="sm" pill>{status}</Badge>
          {onToggleStatus && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleStatus(convidado.id); }}
              aria-label={`Alterar status de ${nome}`}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                background: 'var(--color-white)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

ConvidadoItem.propTypes = {
  convidado: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nome: PropTypes.string.isRequired,
    email: PropTypes.string,
    telefone: PropTypes.string,
    status: PropTypes.oneOf(['confirmado', 'pendente', 'recusado']),
    mesa: PropTypes.string,
    acompanhantes: PropTypes.number,
  }).isRequired,
  onToggleStatus: PropTypes.func,
  onClick: PropTypes.func,
};

export { ConvidadoItem };