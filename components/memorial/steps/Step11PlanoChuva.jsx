// C4 — Plano de contingência para chuva (locais externos)
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

export default function Step11PlanoChuva({ onSelect, estadoAtual }) {
  const [plano, setPlano] = useState(estadoAtual?.planoChuva || '');
  const [tenda, setTenda] = useState(estadoAtual?.tendaChuva || false);

  const handleConfirmar = () => {
    onSelect('planoChuva', plano);
    onSelect('tendaChuva', tenda);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Plano B para chuva
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Como o local é externo, precisamos de um plano de contingência:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {['Tenda/cobertura completa', 'Espaço interno reserva', 'Data reserva', 'Decidir no dia', 'Ainda não sei'].map(opcao => (
          <Card key={opcao} interactive selected={plano === opcao} padding="md" onClick={() => setPlano(opcao)} role="radio" aria-checked={plano === opcao}>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)' }}>{o}</span>
          </Card>
        ))}
      </div>

      {plano === 'Tenda/cobertura completa' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Tenda já contratada?</label>
          {[{v:true,l:'Sim'}, {v:false,l:'Ainda não'}].map(opcao => (
            <Card key={String(opcao.v)} interactive selected={tenda === opcao.v} padding="sm" onClick={() => setTenda(opcao.v)} role="radio" aria-checked={tenda === opcao.v}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>{opcao.l}</span>
            </Card>
          ))}
        </div>
      )}

      <button
        aria-label="Confirmar resposta" onClick={handleConfirmar}
        disabled={!plano}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: plano ? 'var(--color-brand)' : 'var(--color-border)',
          color: plano ? 'var(--color-white)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: plano ? 'pointer' : 'not-allowed',
        }}
      >
        Confirmar
      </button>
    </div>
  );
}

Step11PlanoChuva.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step11PlanoChuva };