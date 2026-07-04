// Etapa de tipo de cerimônia — 8 opções com ícones SVG próprios
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: 'catolica', label: 'Católica', icone: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M6 8l12-4M6 16l12 4" />
    </svg>
  )},
  { valor: 'evangelica', label: 'Evangélica', icone: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )},
  { valor: 'judaica', label: 'Judaica', icone: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
      <path d="M12 6l-6 6 6 6 6-6-6-6z" />
    </svg>
  )},
  { valor: 'espirita', label: 'Espírita', icone: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20" />
    </svg>
  )},
  { valor: 'outra-religiosa', label: 'Outra religiosa', icone: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )},
  { valor: 'civil', label: 'Civil', icone: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V7l8-4 8 4v14" />
      <path d="M9 21v-6h6v6" />
    </svg>
  )},
  { valor: 'simbolica', label: 'Simbólica', icone: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      <path d="M12 8l2 2 4-4" />
    </svg>
  )},
  { valor: 'mista', label: 'Mista', icone: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="12" r="5" />
      <circle cx="15" cy="12" r="5" />
    </svg>
  )},
];

export default function Step02Cerimonia({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);

  const selecionado = estadoAtual?.tipoCerimonia;


  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
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
    <div
      role="radiogroup"
      aria-label="Como será a cerimônia?"
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        animation: 'fadeInUp 300ms ease-out',
      }}
    >
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 640px) {
          .cerimonia-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .cerimonia-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>

      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          Como será a cerimônia?
        </h1>
      </div>

      <div className="cerimonia-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--space-4)' }}>
        {OPCOES.map((opcao) => {
          const isSelected = selecionado === opcao.valor;
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
      <Card
              key={opcao.valor}
              interactive
              selected={isSelected}
              padding="md"
              onClick={() => handleCardClick(opcao)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect('tipoCerimonia', opcao.valor);
                }
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', textAlign: 'center' }}>
                <div style={{ color: isSelected ? 'var(--color-brand)' : 'var(--color-text-muted)' }}>
                  {opcao.icone}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>
                  {opcao.label}
                </span>
              </div>
            </Card>
    </div>
  );
})}
      </div>
    </div>
  );
}

Step02Cerimonia.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step02Cerimonia };