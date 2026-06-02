// Barra de filtros para lista de convidados — busca, status e mesa
// Dependências diretas: React, PropTypes, Input

import React from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input';

export default function ConvidadoFiltros({ busca, onBuscaChange, statusFiltro, onStatusChange, total, confirmados, pendentes, recusados }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
        <Input
          type="search"
          placeholder="Buscar convidado..."
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {[
            { key: '', label: `Todos (${total})` },
            { key: 'confirmado', label: `Confirmados (${confirmados})` },
            { key: 'pendente', label: `Pendentes (${pendentes})` },
            { key: 'recusado', label: `Recusados (${recusados})` },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => onStatusChange(s.key)}
              style={{
                flex: 1,
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                background: statusFiltro === s.key ? 'var(--color-brand-lighter)' : 'var(--color-white)',
                color: statusFiltro === s.key ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                fontWeight: statusFiltro === s.key ? 'var(--font-semibold)' : 'var(--font-normal)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

ConvidadoFiltros.propTypes = {
  busca: PropTypes.string.isRequired,
  onBuscaChange: PropTypes.func.isRequired,
  statusFiltro: PropTypes.string.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  confirmados: PropTypes.number.isRequired,
  pendentes: PropTypes.number.isRequired,
  recusados: PropTypes.number.isRequired,
};

export { ConvidadoFiltros };