// components/memorial/steps/Step33RituaisSaida.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';
import Icon from '../../ui/Icon';

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
  const [selecionados, setSelecionados] = useState(estadoAtual?.rituaisSimbolicos || []);

  const toggle = (valor) => {
    setSelecionados(prev => {
      if (prev.includes(valor)) return prev.filter(v => v !== valor);
      return [...prev, valor];
    });
  };

  const handleConfirmar = () => {
    onSelect('rituaisSimbolicos', selecionados);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

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
            <Card
              key={opcao.valor}
              interactive
              selected={isSelected}
              padding="lg"
              onClick={() => toggle(opcao.valor)}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(opcao.valor);
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
          );
        })}
      </div>

      <button
        onClick={handleConfirmar}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'var(--color-brand)',
          color: 'var(--color-white)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: 'pointer',
        }}
      >
        Confirmar
      </button>
    </div>
  );
}

Step33RituaisSaida.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step33RituaisSaida };
