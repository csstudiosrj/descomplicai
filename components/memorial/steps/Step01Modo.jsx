// Etapa 1 do memorial — escolha do modo de criação
// COM PULSO NO CARD CLICADO — efeito real do PRD
// Dependências: React, PropTypes, Card, Icon

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';

const OPCOES = [
  {
    valor: 'guiado',
    label: 'Me guiem',
    subtexto: 'Prefiro receber sugestões e aprovar. Ideal para quem está começando a imaginar o casamento.',
    icone: 'sparkle',
    cor: 'var(--color-brand-lighter)',
    corPulso: 'rgba(139, 111, 94, 0.25)',
  },
  {
    valor: 'ativo',
    label: 'Já tenho referências',
    subtexto: 'Quero organizar o que imagino. Você vai poder fazer uploads e colar links do Pinterest.',
    icone: 'link',
    cor: 'var(--color-info-light)',
    corPulso: 'rgba(61, 107, 140, 0.25)',
  },
];

export default function Step01Modo({ onSelect, estadoAtual }) {
  const selecionado = estadoAtual?.modoPlanejamento;
  const [cardPulsando, setCardPulsando] = useState(null);

  const handleClick = (opcao) => {
    if (cardPulsando) return; // bloqueia cliques duplos

    setCardPulsando(opcao.valor);

    // Aguarda 350ms do pulso visual antes de avançar
    setTimeout(() => {
      onSelect('modoPlanejamento', opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 350);
  };

  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(opcao);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Como preferem planejar?"
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
          Como vocês preferem planejar?
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
          const isSelected = selecionado === opcao.valor;
          const isPulsando = cardPulsando === opcao.valor;

          return (
            <Card
              key={opcao.valor}
              interactive
              selected={isSelected}
              padding="lg"
              onClick={() => handleClick(opcao)}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${opcao.label}: ${opcao.subtexto}`}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, opcao)}
              style={{
                transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isPulsando ? 'scale(1.04)' : 'scale(1)',
                boxShadow: isPulsando 
                  ? `0 0 0 4px ${opcao.corPulso}, 0 8px 32px ${opcao.corPulso}` 
                  : 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: isSelected ? opcao.cor : 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? 'var(--color-brand)' : 'var(--color-text-muted)',
                    transition: 'background-color 200ms ease, color 200ms ease',
                  }}
                >
                  <Icon name={opcao.icone} size={24} ariaHidden={true} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    {opcao.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 'var(--leading-relaxed)',
                    }}
                  >
                    {opcao.subtexto}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

Step01Modo.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step01Modo };
