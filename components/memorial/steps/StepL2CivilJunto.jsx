// components/memorial/steps/StepL2CivilJunto.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';
import { getTermos } from '../../../utils/linguagemCasal';

const OPCOES = [
    {
      valor: 'sim',
      label: 'Sim',
      subtexto: 'Civil e cerimônia no mesmo dia',
      icone: 'heart',
    },
    {
      valor: 'ja_casados',
      label: 'Já somos casados',
      subtexto: 'Civil já realizado',
      icone: 'check',
    },
    {
      valor: 'nao',
      label: 'Não',
      subtexto: 'Civil em outro momento',
      icone: 'calendar',
    },
];

export default function StepL2CivilJunto({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);
  const perfil = estadoAtual?.perfilCasal || 'nao-especificar';
  const termos = getTermos(perfil);

  const selecionado = estadoAtual?.civilJunto;

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setTimeout(() => {
      onSelect(opcao.campo || opcao.valor, opcao.valor, opcao.cor);
      setCardPulsando(null);
    }, 300);
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
      aria-label={termos.perguntaCivilJunto || 'O civil será junto com a cerimônia?'}
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
          {termos.tituloCivil || 'Casamento civil'}
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          {termos.perguntaCivilJunto || 'O civil será junto com a cerimônia?'}
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
                aria-label={opcao.label}
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
                  {isSelected && (
                    <span aria-hidden="true" style={{ marginLeft: 'auto', color: 'var(--color-brand)' }}>
                      ✓
                    </span>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StepL2CivilJunto.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepL2CivilJunto };
