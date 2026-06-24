// StepE9DocumentacaoEstrangeiro — Documentação para casamento no Brasil está em dia?
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: "sim", label: "Sim", desc: "Documentação em dia para casar no Brasil" },
  { valor: "nao", label: "Não", desc: "Preciso regularizar a documentação" }
];

export default function StepE9DocumentacaoEstrangeiro({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);

  const selecionado = estadoAtual?.documentacaoEstrangeiro;


  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  return (
    <div role="radiogroup" aria-label="Documentação de estrangeiro" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Documentação para casamento no Brasil está em dia?
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
        {OPCOES.map((o) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
      key={opcao.valor}
      style={{
        transition: 'transform 300ms ease, box-shadow 300ms ease',
        transform: cardPulsando === opcao.valor ? 'scale(1.03)' : 'scale(1)',
        boxShadow: cardPulsando === opcao.valor ? `0 0 0 3px ${opcao.cor || 'var(--color-brand)'}` : 'none',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Card key={o.valor} interactive selected={isSelected} padding="lg" onClick={() => onSelect('documentacaoEstrangeiro', o.valor)} role="radio" aria-checked={isSelected} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect('documentacaoEstrangeiro', o.valor); } }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>{o.label}</span>
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

StepE9DocumentacaoEstrangeiro.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepE9DocumentacaoEstrangeiro };
