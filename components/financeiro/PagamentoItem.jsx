// Item de pagamento — controle de parcelas e status de quitação
// Dependências diretas: React, PropTypes, Card, Badge

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatarMoeda } from '../../utils/formatters';

export default function PagamentoItem({ pagamento, onTogglePago }) {
  const { item, valor, vencimento, pago, parcelas, parcelaAtual } = pagamento;

  return (
    <Card variant={pago ? 'flat' : 'default'} padding="md" interactive={!!onTogglePago} onClick={() => onTogglePago?.(pagamento.id)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>{item}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Vencimento: {vencimento}
            {parcelas > 1 && ` · Parcela ${parcelaAtual || 1}/${parcelas}`}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', color: pago ? 'var(--color-success)' : 'var(--color-text-primary)', fontWeight: 'var(--font-semibold)' }}>
            {formatarMoeda(valor)}
          </div>
          <Badge variant={pago ? 'success' : 'warning'} size="sm">{pago ? 'Quitado' : 'Pendente'}</Badge>
        </div>
      </div>
    </Card>
  );
}

PagamentoItem.propTypes = {
  pagamento: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    item: PropTypes.string.isRequired,
    valor: PropTypes.number.isRequired,
    vencimento: PropTypes.string,
    pago: PropTypes.bool,
    parcelas: PropTypes.number,
    parcelaAtual: PropTypes.number,
  }).isRequired,
  onTogglePago: PropTypes.func,
};

export { PagamentoItem };