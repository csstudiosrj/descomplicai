// Card individual de métrica com variação percentual
// Props: titulo, valor, variacao (número positivo/negativo)

import React from 'react';

export default function MetricasCardPainel({ titulo, valor, variacao }) {
  const isPositivo = variacao >= 0;
  const corVariacao = isPositivo ? 'var(--color-success)' : 'var(--color-danger)';

  return (
    <div 
      style={{ 
        padding: 'var(--space-5)', 
        borderRadius: 'var(--radius-lg)', 
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div 
        style={{ 
          fontFamily: 'var(--font-body)', 
          fontSize: 'var(--text-sm)', 
          color: 'var(--color-text-muted)', 
          marginBottom: 'var(--space-2)' 
        }}
      >
        {titulo}
      </div>
      <div 
        style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 'var(--text-2xl)', 
          color: 'var(--color-text-primary)', 
          fontWeight: 'var(--font-bold)',
          marginBottom: 'var(--space-1)'
        }}
      >
        {valor}
      </div>
      {variacao !== undefined && (
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 'var(--space-1)',
            fontFamily: 'var(--font-body)', 
            fontSize: 'var(--text-xs)', 
            color: corVariacao,
            fontWeight: 'var(--font-medium)'
          }}
        >
          <span aria-hidden="true">{isPositivo ? '▲' : '▼'}</span>
          <span>{Math.abs(variacao)}% vs período anterior</span>
        </div>
      )}
    </div>
  );
}
