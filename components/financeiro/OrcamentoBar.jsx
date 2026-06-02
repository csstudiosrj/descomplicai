// Barra de progresso do orçamento — visualização do gasto vs total
// Dependências diretas: React, PropTypes

import React from 'react';
import PropTypes from 'prop-types';
import { formatarMoeda } from '../../utils/formatters';

export default function OrcamentoBar({ gasto, total, alerta = 0.9 }) {
  const percentual = total > 0 ? (gasto / total) * 100 : 0;
  const atingiuAlerta = percentual >= alerta * 100;
  const excedeu = gasto > total;

  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>Orçamento</span>
        <span style={{ color: excedeu ? 'var(--color-danger)' : atingiuAlerta ? 'var(--color-warning)' : 'var(--color-text-primary)', fontWeight: 'var(--font-semibold)' }}>
          {formatarMoeda(gasto)} / {formatarMoeda(total)} ({percentual.toFixed(1)}%)
        </span>
      </div>
      <div style={{ height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.min(percentual, 100)}%`,
            height: '100%',
            borderRadius: 'var(--radius-full)',
            backgroundColor: excedeu ? 'var(--color-danger)' : atingiuAlerta ? 'var(--color-warning)' : 'var(--color-brand)',
            transition: 'width 400ms ease, background-color 300ms ease',
          }}
        />
      </div>
      {excedeu && (
        <div role="alert" style={{ marginTop: 'var(--space-2)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-danger)' }}>
          Orçamento excedido em {formatarMoeda(gasto - total)}
        </div>
      )}
    </div>
  );
}

OrcamentoBar.propTypes = {
  gasto: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  alerta: PropTypes.number,
};

export { OrcamentoBar };