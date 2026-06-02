// Bloco K — Confirmação da lista automática de fornecedores gerada pelo algoritmo
// Mapeia: Step60Fornecedores(K1)
// Dependências diretas: React, PropTypes, Card, gerador-memorial.js

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import { listarFornecedoresNecessarios } from '../../../utils/gerador-memorial';

export default function Step60Fornecedores({ onSelect, estadoAtual }) {
  const fornecedores = listarFornecedoresNecessarios(estadoAtual);

  const handleConfirmar = () => {
    onSelect('fornecedoresNecessarios', fornecedores);
    onSelect('memorialConcluido', true);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Seus fornecedores sugeridos
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Com base em todas as suas escolhas, identificamos estas categorias de fornecedores necessários para seu casamento:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {fornecedores.map((f, i) => (
          <Card key={f} variant="default" padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-brand-lighter)', color: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', flexShrink: 0 }}>
                {i + 1}
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>{f}</span>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-info-light)', border: '1px solid var(--color-info)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-info)', lineHeight: 'var(--leading-relaxed)' }}>
          Você pode adicionar, remover ou substituir fornecedores depois no painel. Esta é apenas uma lista inicial inteligente.
        </p>
      </div>

      <button
        onClick={handleConfirmar}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-4) var(--space-8)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'var(--color-brand)',
          color: 'var(--color-white)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        Finalizar memorial
      </button>
    </div>
  );
}

Step60Fornecedores.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step60Fornecedores };