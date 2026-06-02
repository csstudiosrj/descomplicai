// Anel de progresso circular — usado em loaders e indicadores visuais
// Dependências diretas: React, PropTypes

import React from 'react';
import PropTypes from 'prop-types';

export default function ProgressRing({ progresso = 0, tamanho = 48, espessura = 4, cor = 'var(--color-brand)', corFundo = 'var(--color-border)' }) {
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia - (progresso / 100) * circunferencia;

  return (
    <div
      role="progressbar"
      aria-valuenow={progresso}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${Math.round(progresso)}% completo`}
      style={{ position: 'relative', width: tamanho, height: tamanho }}
    >
      <svg width={tamanho} height={tamanho} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke={corFundo}
          strokeWidth={espessura}
        />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke={cor}
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 400ms ease' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: `${tamanho * 0.3}px`,
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
        }}
      >
        {Math.round(progresso)}%
      </span>
    </div>
  );
}

ProgressRing.propTypes = {
  progresso: PropTypes.number,
  tamanho: PropTypes.number,
  espessura: PropTypes.number,
  cor: PropTypes.string,
  corFundo: PropTypes.string,
};

export { ProgressRing };