// components/memorial/steps/Step55BelezaPadronizacao.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';
import { getTermos } from '../../../utils/linguagemCasal';

const OPCOES = [
    {
      valor: 'natural',
      label: 'Natural',
      subtexto: 'Pele leve, olhos suaves',
      icone: 'sun',
      cor: '#F5A623',
    },
    {
      valor: 'glamour',
      label: 'Glamour',
      subtexto: 'Pele perfeita, olhos marcantes',
      icone: 'star',
      cor: '#D4AF37',
    },
    {
      valor: 'romantica',
      label: 'Romantica',
      subtexto: 'Rosados, soft, delicada',
      icone: 'heart',
      cor: '#E91E63',
    },
    {
      valor: 'vintage',
      label: 'Vintage',
      subtexto: 'Classica, anos 20-50',
      icone: 'clock',
      cor: '#8B6F5E',
    },
];

export default function Step55BelezaPadronizacao({ estado, onSelect }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);

  const selecionado = estado?.estiloMaquiagem;
  const perfil = estado?.perfilCasal || {};
  const termos = getTermos(perfil);

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect('estiloMaquiagem', opcao.valor, opcao.cor);
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
      aria-label="Como sera a beleza?"
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
      `}</style>

      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          Beleza e padronizacao
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Como sera a beleza?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--space-4)' }}>
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
                interactive
                selected={isSelected}
                padding="lg"
                onClick={() => handleCardClick(opcao)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, opcao)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: isSelected ? 'var(--color-brand-lighter)' : 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? 'var(--color-brand)' : 'var(--color-text-muted)',
                    flexShrink: 0,
                  }}>
                    <Icon name={opcao.icone} size={24} ariaHidden={true} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                      {opcao.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                      {opcao.subtexto}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Step55BelezaPadronizacao.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estado: PropTypes.object,
};

export { Step55BelezaPadronizacao };
