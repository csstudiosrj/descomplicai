// Card de métricas do fornecedor — leads, conversão, faturamento
// Dependências diretas: React, PropTypes, Card

import React from 'react';
import PropTypes from 'prop-types';
import Card from '../ui/Card';
import { formatarMoeda } from '../../utils/formatters';

export default function MetricasCard({ leads, conversao, faturamento, novosEstaSemana }) {
  const cards = [
    { label: 'Leads este mês', valor: leads, cor: 'var(--color-text-primary)' },
    { label: 'Taxa de conversão', valor: `${conversao}%`, cor: 'var(--color-success)' },
    { label: 'Faturamento', valor: formatarMoeda(faturamento), cor: 'var(--color-brand)' },
    { label: 'Novos esta semana', valor: `+${novosEstaSemana}`, cor: 'var(--color-info)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
      {cards.map((c) => (
        <Card key={c.label} variant="elevated" padding="lg">
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>{c.label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: c.cor }}>{c.valor}</div>
        </Card>
      ))}
    </div>
  );
}

MetricasCard.propTypes = {
  leads: PropTypes.number.isRequired,
  conversao: PropTypes.number.isRequired,
  faturamento: PropTypes.number.isRequired,
  novosEstaSemana: PropTypes.number.isRequired,
};

export { MetricasCard };