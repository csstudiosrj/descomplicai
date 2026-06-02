// Item de tarefa do checklist — checkbox, categoria e prazo
// Dependências direitas: React, PropTypes, Card, Badge

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function TarefaItem({ tarefa, onToggle, onClick }) {
  const { texto, feita, categoria, prazo, responsavel } = tarefa;

  return (
    <Card variant={feita ? 'flat' : 'default'} padding="md" interactive onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle?.(tarefa.id); }}
          aria-checked={feita}
          role="checkbox"
          aria-label={feita ? 'Marcar como pendente' : 'Marcar como feita'}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: 'var(--radius-sm)',
            border: `2px solid ${feita ? 'var(--color-success)' : 'var(--color-border-strong)'}`,
            background: feita ? 'var(--color-success)' : 'var(--color-white)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {feita && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: feita ? 'var(--font-normal)' : 'var(--font-medium)', color: feita ? 'var(--color-text-muted)' : 'var(--color-text-primary)', textDecoration: feita ? 'line-through' : 'none' }}>
            {texto}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginTop: 'var(--space-1)', flexWrap: 'wrap' }}>
            <Badge variant="default" size="sm">{categoria}</Badge>
            {prazo && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Prazo: {prazo}</span>}
            {responsavel && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Resp: {responsavel}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}

TarefaItem.propTypes = {
  tarefa: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    texto: PropTypes.string.isRequired,
    feita: PropTypes.bool,
    categoria: PropTypes.string,
    prazo: PropTypes.string,
    responsavel: PropTypes.string,
  }).isRequired,
  onToggle: PropTypes.func,
  onClick: PropTypes.func,
};

export { TarefaItem };