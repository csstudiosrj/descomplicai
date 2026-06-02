// Barra de progresso do questionário com informação de bloco
// Dependências diretas: React, PropTypes

import React from 'react';
import PropTypes from 'prop-types';

export default function ProgressBar({ etapaAtual, etapasTotais, blocoAtual, nomeBlocoAtual }) {
  const progresso = etapasTotais > 0 ? (etapaAtual / etapasTotais) * 100 : 0;
  const etapaReal = Math.min(etapaAtual + 1, etapasTotais);

  return (
    <div
      role="progressbar"
      aria-valuenow={etapaReal}
      aria-valuemin={0}
      aria-valuemax={etapasTotais}
      aria-label={`Progresso do memorial: etapa ${etapaReal} de ${etapasTotais}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 'var(--z-sticky)',
        backgroundColor: 'var(--color-white)',
      }}
    >
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

      <div
        style={{
          padding: 'var(--space-2) var(--space-4)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          display: 'none',
        }}
        className="progress-info-desktop"
      >
        Etapa {etapaReal} de {etapasTotais}
        {nomeBlocoAtual ? ` · ${nomeBlocoAtual}` : ''}
      </div>

      <style jsx>{`
        @media (min-width: 390px) {
          .progress-info-desktop {
            display: block !important;
          }
        }
        @media (max-width: 389px) {
          .progress-info-desktop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

ProgressBar.propTypes = {
  etapaAtual: PropTypes.number.isRequired,
  etapasTotais: PropTypes.number.isRequired,
  blocoAtual: PropTypes.string,
  nomeBlocoAtual: PropTypes.string,
};

export { ProgressBar };