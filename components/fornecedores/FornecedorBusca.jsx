// Campo de busca e filtros para fornecedores
// Dependências diretas: React, PropTypes, Input

import React from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input';

export default function FornecedorBusca({ busca, onBuscaChange, categorias, categoriaAtiva, onCategoriaChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
      <Input
        type="search"
        placeholder="Buscar fornecedor..."
        value={busca}
        onChange={(e) => onBuscaChange(e.target.value)}
        prefix={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        }
      />
      {categorias?.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            onClick={() => onCategoriaChange('')}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--color-border)',
              background: !categoriaAtiva ? 'var(--color-brand)' : 'var(--color-white)',
              color: !categoriaAtiva ? 'var(--color-white)' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoriaChange(cat)}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--color-border)',
                background: categoriaAtiva === cat ? 'var(--color-brand)' : 'var(--color-white)',
                color: categoriaAtiva === cat ? 'var(--color-white)' : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

FornecedorBusca.propTypes = {
  busca: PropTypes.string.isRequired,
  onBuscaChange: PropTypes.func.isRequired,
  categorias: PropTypes.arrayOf(PropTypes.string),
  categoriaAtiva: PropTypes.string,
  onCategoriaChange: PropTypes.func.isRequired,
};

export { FornecedorBusca };