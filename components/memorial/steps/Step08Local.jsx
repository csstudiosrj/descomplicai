// Etapa de tipo de local — 9 opções + outro, com aviso para locais externos
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const OPCOES = [
  { valor: 'salao', label: 'Salão de festas', icone: 'home' },
  { valor: 'sitio', label: 'Sítio / Fazenda', icone: 'home' },
  { valor: 'praia', label: 'Praia', icone: 'home' },
  { valor: 'hotel', label: 'Hotel', icone: 'home' },
  { valor: 'galpao', label: 'Galpão / Loft', icone: 'home' },
  { valor: 'jardim', label: 'Jardim / Parque', icone: 'home' },
  { valor: 'rooftop', label: 'Rooftop', icone: 'home' },
  { valor: 'haras', label: 'Haras / Campo', icone: 'home' },
  { valor: 'vinicola', label: 'Vinícola', icone: 'home' },
  { valor: 'outro', label: 'Outro', icone: 'search' },
];

const LOCAIS_EXTERNOS = ['praia', 'sitio', 'jardim', 'rooftop', 'haras'];

export default function Step03Local({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);

  const selecionado = estadoAtual?.tipoLocal;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };
  const mostrarAviso = selecionado && LOCAIS_EXTERNOS.includes(selecionado);

  return (
    <div
      role="radiogroup"
      aria-label="Onde vai acontecer o evento?"
      style={{
        maxWidth: '640px',
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
          .local-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>

      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          Onde vai acontecer o evento?
        </h1>
      </div>

      <div className="local-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--space-4)' }}>
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
                  onSelect('tipoLocal', opcao.valor);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--color-brand-lighter)' : 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'var(--color-brand)' : 'var(--color-text-muted)',
                  flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {opcao.valor === 'outro' ? (
                      <>
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </>
                    ) : (
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    )}
                  </svg>
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

      {mostrarAviso && (
        <div
          role="alert"
          style={{
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-info-light)',
            border: '1px solid var(--color-info)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-info)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          Vamos incluir no checklist o planejamento de plano B para chuva — você decide os detalhes depois.
        </div>
      )}
    </div>
  );
}

Step03Local.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step03Local };