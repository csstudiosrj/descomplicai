// C4b — Transporte entre locais (quando cerimônia e festa são separados)
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

export default function Step11bTransporte({ onSelect, estadoAtual }) {
  const [transporte, setTransporte] = useState(estadoAtual?.transporteConvidados || '');
  const [onibus, setOnibus] = useState(estadoAtual?.onibusNoivos || false);

  const handleConfirmar = () => {
    onSelect('transporteConvidados', transporte);
    onSelect('onibusNoivos', onibus);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Transporte entre locais
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Como os convidados irão da cerimônia para a festa?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {['Ônibus/van fretado', 'Transporte individual (carros/uber)', 'Curta distância (a pé)', 'Ainda não sei'].map(o => (
          <Card key={o} interactive selected={transporte === o} padding="md" onClick={() => setTransporte(o)} role="radio" aria-checked={transporte === o}>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)' }}>{o}</span>
          </Card>
        ))}
      </div>

      {transporte === 'Ônibus/van fretado' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Ônibus para ${termos.pessoa1} e ${termos.pessoa2} também?</label>
          {[{v:true,l:'Sim'}, {v:false,l:'Não, carro separado'}].map(o => (
            <Card key={String(o.v)} interactive selected={onibus === o.v} padding="sm" onClick={() => setOnibus(o.v)} role="radio" aria-checked={onibus === o.v}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>{o.l}</span>
            </Card>
          ))}
        </div>
      )}

      <button
        onClick={handleConfirmar}
        disabled={!transporte}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: transporte ? 'var(--color-brand)' : 'var(--color-border)',
          color: transporte ? 'var(--color-white)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: transporte ? 'pointer' : 'not-allowed',
        }}
      >
        Confirmar
      </button>
    </div>
  );
}

Step11bTransporte.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step11bTransporte };