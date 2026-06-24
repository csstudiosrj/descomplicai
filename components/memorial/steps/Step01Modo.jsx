// Etapa 1 do memorial — escolha do modo de criação (guiado ou livre)
// Dependências diretas: React, PropTypes, Card, Icon

import React from 'react';
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
  },
  {
    valor: 'ativo',
    label: 'Já tenho referências',
    subtexto: 'Quero organizar o que imagino. Você vai poder fazer uploads e colar links do Pinterest.',
    icone: 'link',
    cor: 'var(--color-info-light)',
  },
];

export default function Step01Modo({ onSelect, estadoAtual }) {
  const selecionado = estadoAtual?.modoPlanejamento;

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
          return (
            <Card
              key={opcao.valor}
              interactive
              selected={isSelected}
              padding="lg"
              onClick={() => onSelect('modoPlanejamento', opcao.valor, opcao.cor)}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${opcao.label}: ${opcao.subtexto}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect('modoPlanejamento', opcao.valor, opcao.cor);
                }
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
