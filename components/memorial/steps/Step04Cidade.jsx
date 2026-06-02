// B3 — Cidade e estado do casamento
// Dependências diretas: React, PropTypes, Input

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../ui/Input';

export default function Step04Cidade({ onSelect, estadoAtual }) {
  const [cidade, setCidade] = useState(estadoAtual?.cidadeEvento || '');
  const [estado, setEstado] = useState(estadoAtual?.estadoEvento || '');

  const handleConfirmar = () => {
    onSelect('cidadeEvento', cidade.trim());
    onSelect('estadoEvento', estado.trim());
  };

  const podeAvancar = cidade.trim().length > 2 && estado.trim().length > 1;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Onde será o casamento?
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input label="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: Rio de Janeiro" required />
        <Input label="Estado (sigla)" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Ex: RJ" required />
      </div>

      <button
        onClick={handleConfirmar}
        disabled={!podeAvancar}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: podeAvancar ? 'var(--color-brand)' : 'var(--color-border)',
          color: podeAvancar ? 'var(--color-white)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: podeAvancar ? 'pointer' : 'not-allowed',
        }}
      >
        Confirmar local
      </button>
    </div>
  );
}

Step04Cidade.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step04Cidade };