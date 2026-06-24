// Estrelas de avaliação — SVG puro, sem biblioteca, sem emoji
// Props: nota (1-5), tamanho (px), corAtiva, corInativa

import React from 'react';

export default function EstrelasAvaliacao({ 
  nota = 0, 
  tamanho = 16, 
  corAtiva = 'var(--color-warning)', 
  corInativa = 'var(--color-border-strong)' 
}) {
  const estrelas = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }} aria-label={`Avaliação ${nota} de 5 estrelas`}>
      {estrelas.map((s) => {
        const preenchida = s <= Math.round(nota);
        return (
          <svg
            key={s}
            width={tamanho}
            height={tamanho}
            viewBox="0 0 24 24"
            fill={preenchida ? corAtiva : 'none'}
            stroke={preenchida ? corAtiva : corInativa}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
}
