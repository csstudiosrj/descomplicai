// B1 — Nome do casal e identificação
// Dependências diretas: React, PropTypes, Input

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../ui/Input';

export default function Step02NomeCasal({ onSelect, estadoAtual }) {
  const [p1, setP1] = useState(estadoAtual?.nomePessoa1 || '');
  const [p2, setP2] = useState(estadoAtual?.nomePessoa2 || '');
  const [juntos, setJuntos] = useState(estadoAtual?.nomeJuntos || '');

  const handleConfirmar = () => {
    onSelect('nomePessoa1', p1.trim());
    onSelect('nomePessoa2', p2.trim());
    onSelect('nomeJuntos', juntos.trim() || `${p1.trim()} e ${p2.trim()}`);
  };

  const podeAvancar = p1.trim().length > 1 && p2.trim().length > 1;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Quem são os noivos?
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Como devemos chamar vocês?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input label="Nome da primeira pessoa" value={p1} onChange={(e) => setP1(e.target.value)} placeholder="Ex: Ana" required />
        <Input label="Nome da segunda pessoa" value={p2} onChange={(e) => setP2(e.target.value)} placeholder="Ex: Pedro" required />
        <Input label="Como querem ser chamados juntos (opcional)" value={juntos} onChange={(e) => setJuntos(e.target.value)} placeholder="Ex: Ana e Pedro, Aninha e Pedrinho..." hint="Se deixar em branco, usamos os dois nomes" />
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
        Confirmar
      </button>
    </div>
  );
}

Step02NomeCasal.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step02NomeCasal };