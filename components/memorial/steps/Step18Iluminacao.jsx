// components/memorial/steps/Step18Iluminacao.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';

const OPCOES = [
    {
      valor: 'ambiente',
      label: 'Ambiente',
      subtexto: 'Luz suave e aconchegante',
      icone: 'light',
    },
    {
      valor: 'cenica',
      label: 'Cênica',
      subtexto: 'Efeitos dramáticos e focos',
      icone: 'spotlight',
    },
    {
      valor: 'ambas',
      label: 'Ambas',
      subtexto: 'Iluminação ambiente + cênica',
      icone: 'sparkle',
    },
    {
      valor: 'natural',
      label: 'Natural',
      subtexto: 'Apenas luz natural (dia)',
      icone: 'sun',
    },
];

export default function Step18Iluminacao({ onSelect, estadoAtual }) {
  const selecionado = estadoAtual?.iluminacao;

  return (
    <div
      role="radiogroup"
      aria-label="Que tipo de iluminação desejam?"
      style={
        maxWidth: '640px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        animation: 'fadeInUp 300ms ease-out',
      }
    >
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div>
        <h1 style={ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }>
          Iluminação
        </h1>
        <p style={ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }>
          Que tipo de iluminação desejam?
        </p>
      </div>

      <div style={ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--space-4)' }>
        {OPCOES.map((opcao) => {
          const isSelected = selecionado === opcao.valor;
          return (
            <Card
              key={opcao.valor}
              interactive
              selected={isSelected}
              padding="lg"
              onClick={() => onSelect('iluminacao', opcao.valor)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect('iluminacao', opcao.valor);
                }
              }}
            >
              <div style={ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }>
                <div style={
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isSelected ? 'var(--color-brand-lighter)' : 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? 'var(--color-brand)' : 'var(--color-text-muted)',
                  flexShrink: 0,
                }>
                  <Icon name={opcao.icone} size={24} ariaHidden={true} />
                </div>
                <div>
                  <div style={ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }>
                    {opcao.label}
                  </div>
                  <div style={ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }>
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

Step18Iluminacao.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step18Iluminacao };
