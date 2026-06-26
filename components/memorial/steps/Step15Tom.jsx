// D4 — Tom da identidade visual
// Dependências diretas: React, PropTypes, Card

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '../../ui/Card';

const TONS = [
  'Romântico',
  'Elegante',
  'Divertido',
  'Sofisticado',
  'Natural',
  'Moderno',
  'Vintage',
  'Minimalista',
  'Acolhedor',
  'Glamuroso',
];

export default function Step15Tom({ onSelect, estadoAtual }) {
  const [selecionados, setSelecionados] = useState(estadoAtual?.tomsIdentidade || []);

  const toggle = (t) => {
    if (selecionados.includes(t)) {
      setSelecionados(selecionados.filter(x => x !== t));
    } else if (selecionados.length < 3) {
      setSelecionados([...selecionados, t]);
    }
  };

  const handleConfirmar = () => {
    onSelect('tomsIdentidade', selecionados);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', animation: 'fadeInUp 300ms ease-out' }}>
      <style jsx>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>
        Tom da identidade
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
        Escolha até 3 palavras que definem a vibe do evento:
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        {TONS.map((t) => (
          <button
            key={t}
            onClick={() => toggle(t)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: selecionados.includes(t) ? '2px solid var(--color-brand)' : '1.5px solid var(--color-border)',
              background: selecionados.includes(t) ? 'var(--color-brand-lighter)' : 'var(--color-white)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              fontWeight: selecionados.includes(t) ? 'var(--font-semibold)' : 'var(--font-normal)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {selecionados.length > 0 && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {selecionados.length}/3 selecionados
        </p>
      )}

      <button
        aria-label="Confirmar resposta" onClick={handleConfirmar}
        disabled={selecionados.length === 0}
        style={{
          alignSelf: 'flex-start',
          padding: 'var(--space-3) var(--space-6)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: selecionados.length > 0 ? 'var(--color-brand)' : 'var(--color-border)',
          color: selecionados.length > 0 ? 'var(--color-white)' : 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          fontWeight: 'var(--font-medium)',
          cursor: selecionados.length > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        Confirmar
      </button>
    </div>
  );
}

Step15Tom.propTypes = {
  onSelect: PropTypes.func.isRequired,
  estadoAtual: PropTypes.object,
};

export { Step15Tom };