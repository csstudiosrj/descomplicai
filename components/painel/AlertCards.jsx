// Cards de alerta/destaque no painel — resumo visual de pendências
// Dependências diretas: React, PropTypes, Card, Badge

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function AlertCards({ tarefasPendentes, orcamentoUsado, diasParaCasamento }) {
  const cards = [
    { label: 'Tarefas pendentes', valor: tarefasPendentes, variant: tarefasPendentes > 5 ? 'warning' : 'success', sufixo: '' },
    { label: 'Orçamento utilizado', valor: `${orcamentoUsado}%`, variant: orcamentoUsado > 90 ? 'danger' : orcamentoUsado > 70 ? 'warning' : 'success', sufixo: '' },
    { label: 'Dias para o casamento', valor: diasParaCasamento, variant: diasParaCasamento < 30 ? 'danger' : diasParaCasamento < 90 ? 'warning' : 'info', sufixo: diasParaCasamento === 1 ? 'dia' : 'dias' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
      {cards.map((c) => (
        <Card key={c.label} variant="elevated" padding="lg">
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>{c.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>{c.valor}</span>
            {c.sufixo && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{c.sufixo}</span>}
            <Badge variant={c.variant} size="sm" pill />
          </div>
        </Card>
      ))}
    </div>
  );
}

AlertCards.propTypes = {
  tarefasPendentes: PropTypes.number.isRequired,
  orcamentoUsado: PropTypes.number.isRequired,
  diasParaCasamento: PropTypes.number.isRequired,
};

export { AlertCards };