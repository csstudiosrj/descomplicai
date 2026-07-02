// StepA13PersonalidadeNoivo — Personalidade da pessoa 2
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "extrovertido", label: "Extrovertido", desc: "Energia contagiante" },
  { valor: "introvertido", label: "Introvertido", desc: "Prefere intimidade" },
  { valor: "pratico", label: "Prático", desc: "Focado em resultados" },
  { valor: "sonhador", label: "Sonhador", desc: "Criativo e idealista" },
  { valor: "organizado", label: "Organizado", desc: "Planejador nato" },
  { valor: "despojado", label: "Despojado", desc: "Leve e espontâneo" }
];

export default function StepA13PersonalidadeNoivo({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);

  const selecionado = estadoAtual?.personalidadeNoivo;


  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcaopcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcaopcao.valor, opcaopcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };
  return (
    <div role="radiogroup" aria-label="Personalidade da pessoa 2" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Personalidade da pessoa 2
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((opcao) => {
          const isSelected = selecionado === opcaopcao.valor;
          return (
            <div
      key={opcaopcao.valor}
      style={{
        transition: 'transform 300ms ease, box-shadow 300ms ease',
        transform: cardPulsando === opcaopcao.valor ? 'scale(1.03)' : 'scale(1)',
        boxShadow: cardPulsando === opcaopcao.valor ? `0 0 0 3px ${opcao.cor || 'var(--color-brand)'}` : 'none',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Card key={opcaopcao.valor} interactive selected={isSelected} padding="lg" onClick={() => handleCardClick(o)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(o); } }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{opcaopcao.label}</span>
                {o.desc && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{o.desc}</span>}
              </div>
            </Card>
    </div>
  );
})}
      </div>
    </div>
  );
}

StepA13PersonalidadeNoivo.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepA13PersonalidadeNoivo };
