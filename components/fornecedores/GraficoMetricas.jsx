// Gráfico de barras CSS puro — zero biblioteca
// Props: dados (array de {dia, valor})

import React from 'react';

export default function GraficoMetricas({ dados = [] }) {
  if (!dados.length) return null;

  const maxValor = Math.max(...dados.map(d => d.valor), 1);

  return (
    <div style={{ width: '100%' }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between',
          gap: '4px',
          height: '120px',
          paddingBottom: 'var(--space-6)',
          position: 'relative'
        }}
        role="img"
        aria-label="Gráfico de visualizações dos últimos 30 dias"
      >
        {dados.map((item, idx) => {
          const alturaPct = (item.valor / maxValor) * 100;
          return (
            <div 
              key={idx}
              style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '16px',
                  height: `${Math.max(alturaPct, 4)}%`,
                  minHeight: '4px',
                  backgroundColor: 'var(--color-brand)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  transition: 'height var(--transition-base)',
                  opacity: item.valor === 0 ? 0.3 : 1
                }}
                title={`${item.valor} visualizações`}
              />
              <span 
                style={{ 
                  fontFamily: 'var(--font-body)', 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.dia}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
