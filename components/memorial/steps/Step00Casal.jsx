/* ==========================================
 * ARQUIVO: components/memorial/steps/Step00Casal.jsx
 * ========================================== */
// Etapa 0 do memorial — coleta dos dados do casal (perfil)
// Título SEMPRE neutro: a resposta do perfil é a própria pergunta

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';

export default function Step00Casal({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);
  const OPCOES = [
    { valor: 'noiva-noivo', label: 'Noiva e Noivo', icone: 'heart', cor: 'var(--color-info-light)' },
    { valor: 'duas-noivas', label: 'Duas Noivas', icone: 'users', cor: 'var(--color-brand-lighter)' },
    { valor: 'dois-noivos', label: 'Dois Noivos', icone: 'users', cor: 'var(--color-brand-lighter)' },
    { valor: 'nao-especificar', label: 'Prefiro não especificar', icone: 'heart', cor: 'var(--color-info-light)' },
  ];

  const selecionado = estadoAtual?.perfilCasal;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(o.valor);
    setTimeout(() => {
      onSelect(o.campo || o.valor, o.valor, o.cor);
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
      aria-label="Quem está se casando?"
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Quem está se casando?
        </h1>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: 'var(--space-4)',
        }}
      >
        {OPCOES.map((opcao) => {
          const isSelected = selecionado === o.valor;
          return (
            <div
              key={o.valor}
              style={{
                transition: 'transform 300ms ease, box-shadow 300ms ease',
                transform: cardPulsando === o.valor ? 'scale(1.03)' : 'scale(1)',
                boxShadow: cardPulsando === o.valor ? `0 0 0 3px ${o.cor || 'var(--color-brand)'}` : 'none',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Card
                interactive
                selected={isSelected}
                padding="md"
                onClick={() => handleCardClick(opcao)}
                role="radio"
                aria-checked={isSelected}
                aria-label={o.label}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect('perfilCasal', o.valor, o.cor);
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isSelected ? o.cor : 'var(--color-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? 'var(--color-brand)' : 'var(--color-text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={o.icone} size={24} ariaHidden={true} />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {o.label}
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

Step00Casal.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step00Casal };
