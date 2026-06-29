import { getTermos } from '../../../utils/linguagemCasal';
// components/memorial/steps/StepM2FotosLuaDeMel.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';

export default function StepM2FotosLuaDeMel({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);

  const perfil = estadoAtual?.perfilCasal || 'nao-especificar';
  const termos = getTermos(perfil);

  const OPCOES = [
    {
      valor: true,
      label: 'Sim',
      subtexto: `Ensaio pós-${termos.celebracao} no destino`,
      icone: 'camera',
    },
    {
      valor: false,
      label: 'Não',
      subtexto: 'Apenas descanso e aproveitar',
      icone: 'x',
    },
  ];

  const selecionado = estadoAtual?.fotosLuaDeMel;

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
      aria-label="Desejam fotos na lua de mel?"
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
          Fotos na lua de mel
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Desejam fotos na lua de mel?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--space-4)' }}>
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
              key={String(o.valor)}
              interactive
              selected={isSelected}
              padding="lg"
              onClick={() => handleCardClick(opcao)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect('fotosLuaDeMel', o.valor);
                }
              }}
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
                  <Icon name={o.icone} size={24} ariaHidden={true} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>
                    {o.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                    {o.subtexto}
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

StepM2FotosLuaDeMel.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepM2FotosLuaDeMel };