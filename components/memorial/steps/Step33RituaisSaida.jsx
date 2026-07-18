// components/memorial/steps/Step33RituaisSaida.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';
import { getTermos } from "../../../utils/linguagemCasal";

const OPCOES = [
  {
    valor: 'velas',
    label: 'Cerimônia das velas',
    subtexto: 'União das famílias',
    icone: 'flame',
  },
  {
    valor: 'areia',
    label: 'Cerimônia da areia',
    subtexto: 'Mistura de cores',
    icone: 'sun',
  },
  {
    valor: 'vinho',
    label: 'Cálice do vinho',
    subtexto: 'Tradição cristã',
    icone: 'wine',
  },
  {
    valor: 'arroz',
    label: 'Chuva de arroz/pétalas',
    subtexto: 'Saída clássica',
    icone: 'flower',
  },
  {
    valor: 'burbujas',
    label: 'Bolhas de sabão',
    subtexto: 'Saída divertida e fotogênica',
    icone: 'circle',
  },
];

export default function Step33RituaisSaida({ onSelect, estadoAtual }) {
  const [cardPulsando, setCardPulsando] = React.useState(null);

  const perfil = estadoAtual?.perfilCasal || "nao-especificar";
  const termos = getTermos(perfil);

  const [selecionados, setSelecionados] = useState(estadoAtual?.rituaisSimbolicos || []);

  // Avança automaticamente após seleção (com delay para animação)
  useEffect(() => {
    if (selecionados.length > 0) {
      const timer = setTimeout(() => {
        onSelect('rituaisSimbolicos', selecionados);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selecionados, onSelect]);

  const toggle = (valor) => {
    setSelecionados(prev => {
      if (prev.includes(valor)) return prev.filter(v => v !== valor);
      return [...prev, valor];
    });
  };

  const handleCardClick = (opcao) => {
    if (cardPulsando) return;
    setCardPulsando(opcao.valor);
    toggle(opcao.valor);
    setTimeout(() => setCardPulsando(null), 350);
  };

  const handleKeyDown = (e, opcao) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(opcao);
    }
  };

  return (
    <div
      role="group"
      aria-label="Rituais simbólicos"
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
          Rituais e saída
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
          Desejam rituais simbólicos?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 'var(--space-4)' }}>
        {OPCOES.map((opcao) => {
          const isSelected = selecionados.includes(opcao.valor);
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
                role="checkbox"
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

Step33RituaisSaida.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step33RituaisSaida };
