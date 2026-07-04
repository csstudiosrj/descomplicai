// C2 — Cerimônia e festa no mesmo local?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: true, label: 'Sim, tudo no mesmo lugar', cor: 'var(--color-brand-lighter)' },
  { valor: false, label: 'Não, locais diferentes', cor: 'var(--color-info-light)' },
];

export default function Step09MesmoLocal({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = useState(null);
  const selecionado = estadoAtual?.ceremoniaFestaMesmoLocal;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect('ceremoniaFestaMesmoLocal', opcao.valor, opcao.cor);
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
    <div role="radiogroup" aria-label="Cerimônia e festa no mesmo local?" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Cerimônia e festa no mesmo local?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((opcao) => {
          const isSelected = selecionado === opcao.valor;
          return (
            <div
              key={String(opcao.valor)}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === opcao.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === opcao.valor ? `0 0 0 3px ${opcao.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card
                interactive
                selected={isSelected}
                padding="lg"
                onClick={() => handleCardClick(opcao)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, opcao)}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)' }}>{opcao.label}</span>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Step09MesmoLocal.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step09MesmoLocal };