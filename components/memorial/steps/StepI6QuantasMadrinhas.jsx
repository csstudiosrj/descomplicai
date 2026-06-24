// components/memorial/steps/StepI6QuantasMadrinhas.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function StepI6QuantasMadrinhas({ onSelect, estadoAtual }) {
  const [valor, setValor] = useState(estadoAtual?.quantasMadrinhas || '');

  const handleConfirmar = () => {
    if (valor !== '') {
      onSelect('quantasMadrinhas', Number(valor));
    }
  };

  return (
    <div style={ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div>
        <h1 style={ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }>
          Quantas madrinhas
        </h1>
        <p style={ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }>
          Quantas madrinhas terão?
        </p>
      </div>

      <div style={ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }>
        <input
          type="number"
          min="0"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Digite um número..."
          style={
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-border)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-primary)',
            background: 'var(--color-white)',
          }
        />
        <button
          onClick={handleConfirmar}
          disabled={valor === ''}
          style={
            alignSelf: 'flex-start',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: valor !== '' ? 'var(--color-brand)' : 'var(--color-border)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-medium)',
            cursor: valor !== '' ? 'pointer' : 'not-allowed',
          }
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

StepI6QuantasMadrinhas.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepI6QuantasMadrinhas };
