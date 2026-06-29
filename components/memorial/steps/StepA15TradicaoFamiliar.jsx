import { getTermos } from "../../../utils/linguagemCasal";
// StepA15TradicaoFamiliar — Há alguma tradição familiar importante?
// Dependências diretas: React, PropTypes, Input

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../ui/Input';

export default function StepA15TradicaoFamiliar({
  const perfil = estadoAtual?.perfilCasal || "nao-especificar";
  const termos = getTermos(perfil); onSelect, estadoAtual }) {
  const [valor, setValor] = useState(estadoAtual?.tradicaoFamiliar || '');

  const handleConfirmar = () => {
    onSelect('tradicaoFamiliar', valor.trim());
  };

  const podeAvancar = valor.trim().length > 0;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Há alguma tradição familiar importante?
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Conte-nos se há algo especial da família que gostariam de incluir.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input label="Tradição" value={valor} onChange={(e) => setValor(e.target.value)} placeholder={`Ex: Todo ${termos.celebracao} na família tem churrasco no dia seguinte`}  />
      </div>

      <button
        aria-label="Confirmar resposta" onClick={handleConfirmar}
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

StepA15TradicaoFamiliar.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepA15TradicaoFamiliar };
