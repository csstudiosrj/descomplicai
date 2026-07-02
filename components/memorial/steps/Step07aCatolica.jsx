// B6a — Detalhes da cerimônia católica
// Dependências diretas: React, PropTypes, Input, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../ui/Input';
import Card from '../../ui/Card';

export default function Step07aCatolica({ onSelect, estadoAtual }) {
  const [padrinhos, setPadrinhos] = useState(estadoAtual?.padrinhos || 6);
  const [paroquiaDefinida, setParoquiaDefinida] = useState(estadoAtual?.paroquiaDefinida || false);
  const [nomeParoquia, setNomeParoquia] = useState(estadoAtual?.nomeParoquia || '');

  const handleConfirmar = () => {
    onSelect('padrinhos', Number(padrinhos));
    onSelect('paroquiaDefinida', paroquiaDefinida);
    if (paroquiaDefinida) onSelect('nomeParoquia', nomeParoquia.trim());
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Detalhes da cerimônia católica
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          label="Quantos casais de padrinhos?"
          type="number"
          value={String(padrinhos)}
          onChange={(e) => setPadrinhos(Math.min(12, Math.max(0, Number(e.target.value))))}
          hint="Máximo recomendado: 12 casais"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-secondary)' }}>Já tem paróquia definida?</label>
          {[{v:true,l:'Sim'}, {v:false,l:'Ainda não'}].map(opcao => (
            <Card key={String(opcao.v)} interactive selected={paroquiaDefinida === opcao.v} padding="md" onClick={() => setParoquiaDefinida(opcao.v)} role="radio" aria-checked={paroquiaDefinida === opcao.v}>
              <span style={{ fontFamily: 'var(--font-body)' }}>{opcao.l}</span>
            </Card>
          ))}
        </div>

        {paroquiaDefinida && (
          <Input
            label="Nome da paróquia"
            value={nomeParoquia}
            onChange={(e) => setNomeParoquia(e.target.value)}
            placeholder="Ex: Paróquia Nossa Senhora da Paz"
          />
        )}
      </div>

      <button
        aria-label="Confirmar resposta" onClick={handleConfirmar}
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
        Confirmar
      </button>
    </div>
  );
}

Step07aCatolica.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step07aCatolica };