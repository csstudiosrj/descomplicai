// Etapa 0 do memorial — coleta dos dados do casal (perfil)
// Dependências diretas: React, PropTypes, Card, Icon

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';

const OPCOES = [
  { valor: 'noiva-noivo', label: 'Noiva e Noivo', icone: 'users' },
  { valor: 'duas-noivas', label: 'Duas Noivas', icone: 'users' },
  { valor: 'dois-noivos', label: 'Dois Noivos', icone: 'users' },
  { valor: 'nao-especificar', label: 'Prefiro não especificar', icone: 'heart' },
];

export default function Step00Casal({ onSelect, estadoAtual }) {
  const selecionado = estadoAtual?.perfilCasal;

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
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            lineHeight: 'var(--leading-tight)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Quem são os noivos?
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
              padding="md"
              onClick={() => onSelect('perfilCasal', opcao.valor)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect('perfilCasal', opcao.valor);
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
                    backgroundColor: isSelected ? 'var(--color-brand-lighter)' : 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? 'var(--color-brand)' : 'var(--color-text-muted)',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={opcao.icone} size={24} ariaHidden={true} />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {opcao.label}
                </span>
              </div>
            </Card>
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