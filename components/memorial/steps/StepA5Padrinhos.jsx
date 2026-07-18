// components/memorial/steps/StepA5Padrinhos.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';
import { getTermos } from "../../../utils/linguagemCasal";

const OPCOES_PADRINHOS = [
  {
    valor: true,
    label: 'Sim, já escolhemos',
    subtexto: 'Temos padrinhos definidos',
    icone: 'users',
  },
  {
    valor: false,
    label: 'Ainda não',
    subtexto: 'Vamos definir depois',
    icone: 'clock',
  },
];

export default function StepA5Padrinhos({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);

  const perfil = estadoAtual?.perfilCasal || "nao-especificar";
  const termos = getTermos(perfil);

  const [escolhidos, setEscolhidos] = useState(estadoAtual?.padrinhosEscolhidos ?? null);
  const [quantos, setQuantos] = useState(estadoAtual?.quantosPadrinhos || '');

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    setEscolhidos(opcao.valor);
    if (!opcao.valor) {
      onSelect('padrinhosEscolhidos', false);
    }
    setTimeout(() => {
      setCardPulsando(null);
    }, 350);
  };

  const handleConfirmar = () => {
    if (escolhidos === true && quantos !== '') {
      onSelect('padrinhosEscolhidos', true);
      onSelect('quantosPadrinhos', Number(quantos));
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-tight)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          Padrinhos
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Já escolheram os padrinhos?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--space-4)' }}>
        {OPCOES_PADRINHOS.map((opcao) => {
          const isSelected = escolhidos === opcao.valor;
          return (
            <div
              key={String(opcao.valor)}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(opcao);
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

      {escolhidos === true && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', animation: 'fadeInUp 200ms ease-out' }}>
          <label style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
            Quantos padrinhos?
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={quantos}
            onChange={(e) => setQuantos(e.target.value)}
            placeholder="Ex: 6"
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-white)',
              maxWidth: '200px',
            }}
          />
        </div>
      )}

      {escolhidos === true && (
        <button
          aria-label="Confirmar resposta" onClick={handleConfirmar}
          disabled={quantos === ''}
          style={{
            alignSelf: 'flex-start',
            padding: 'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: quantos !== '' ? 'var(--color-brand)' : 'var(--color-border)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-medium)',
            cursor: quantos !== '' ? 'pointer' : 'not-allowed',
          }}
        >
          Confirmar
        </button>
      )}
    </div>
  );
}

StepA5Padrinhos.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { StepA5Padrinhos };
