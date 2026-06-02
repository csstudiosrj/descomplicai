// B6d — Rituais simbólicos livres (cerimônia simbólica)
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const RITUAIS = [
  'Areia',
  'Vela',
  'Vinho',
  'Rosas',
  'Cordas de mãos',
  'Árvore',
  'Pétalas',
  'Balões',
  'Lágrimas de alegria',
  'Escrita de votos',
];

export default function Step07dSimbolica({ onSelect, estadoAtual }) {
  const [selecionados, setSelecionados] = useState(estadoAtual?.rituaisSimbolicos || []);

  const toggle = (r) => {
    setSelecionados(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  const handleConfirmar = () => {
    onSelect('rituaisSimbolicos', selecionados);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Rituais simbólicos
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Escolha os rituais que deseja incluir na cerimônia simbólica:
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        {RITUAIS.map((r) => (
          <button
            key={r}
            onClick={() => toggle(r)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: selecionados.includes(r) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)',
              background: selecionados.includes(r) ? 'var(--color-brand-lighter)' : 'var(--color-white)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              fontWeight: selecionados.includes(r) ? 'var(--font-semibold)' : 'var(--font-normal)',
            }}
          >
            {r}
          </button>
        ))}
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
        Confirmar rituais
      </button>
    </div>
  );
}

Step07dSimbolica.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step07dSimbolica };