// Barra de progresso do questionário — visual minimalista, sem números
// Dependências diretas: React, PropTypes

import React from 'react';
import PropTypes from 'prop-types';

export default function ProgressBar({ etapaAtual, etapasTotais, nomeBlocoAtual }) {
  const progresso = etapasTotais > 0 ? (etapaAtual / etapasTotais) * 100 : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={etapaAtual}
      aria-valuemin={0}
      aria-valuemax={etapasTotais}
      aria-label={`Progresso: ${nomeBlocoAtual || 'Memorial'}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-sticky)',
        backgroundColor: 'var(--color-white)',
      }}
    >
      {/* Barra visual */}
      <div
        style={{
          height: '4px',
          backgroundColor: 'var(--color-border)',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progresso}%`,
            backgroundColor: 'var(--color-brand)',
            transition: 'width 400ms ease',
          }}
        />
      </div>

      {/* Nome do bloco — sem números */}
      {nomeBlocoAtual && (
        <div
          style={{
            padding: 'var(--space-2) var(--space-4)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {nomeBlocoAtual}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 389px) {
          div[style*="padding: var(--space-2)"] {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

ProgressBar.propTypes = {
  etapaAtual: PropTypes.number.isRequired,
  etapasTotais: PropTypes.number.isRequired,
  nomeBlocoAtual: PropTypes.string,
};

export { ProgressBar };