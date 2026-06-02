// B6c — Detalhes da cerimônia judaica (informativo, confirmação única)
// Dependências diretas: React, PropTypes, Card

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const RITUAIS = [
  { key: 'chupa', label: 'Chupá (dossel nupcial)', desc: 'Sim, incluiremos' },
  { key: 'ketuba', label: 'Ketubá (contrato matrimonial)', desc: 'Sim, incluiremos' },
  { key: 'copo', label: 'Quebra do copo', desc: 'Sim, incluiremos' },
  { key: 'kosher', label: 'Alimentação kosher', desc: 'Adicionaremos aos fornecedores necessários' },
];

export default function Step07cJudaica({ onSelect }) {
  const handleConfirmar = () => {
    onSelect('detalhesJudaicos', true);
    onSelect('rituaisSimbolicos', ['Chupá', 'Ketubá', 'Quebra do copo']);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Detalhes da cerimônia judaica
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Estes são os rituais tradicionais. Confirme que estão incluídos:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {RITUAIS.map((r) => (
          <Card key={r.key} variant="flat" padding="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{r.label}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{r.desc}</span>
            </div>
          </Card>
        ))}
      </div>

      <button
        onClick={handleConfirmar}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'var(--color-brand)',
          color: 'var(--color-white)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: 'pointer',
        }}
      >
        Entendido, vamos continuar
      </button>
    </div>
  );
}

Step07cJudaica.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step07cJudaica };