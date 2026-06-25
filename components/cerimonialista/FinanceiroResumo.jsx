import React from 'react';
import Icon from '../ui/Icon';

function formatarValor(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

export default function FinanceiroResumo({ lancamentos, loading }) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: '100px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
        ))}
      </div>
    );
  }

  const receitas = lancamentos.filter((l) => l.tipo === 'receita');
  const despesas = lancamentos.filter((l) => l.tipo === 'despesa');
  const totalReceitas = receitas.reduce((s, l) => s + (l.valor || 0), 0);
  const totalDespesas = despesas.reduce((s, l) => s + (l.valor || 0), 0);
  const saldo = totalReceitas - totalDespesas;
  const pendentes = lancamentos.filter((l) => !l.pago).reduce((s, l) => s + (l.valor || 0), 0);

  const cards = [
    {
      label: 'Saldo',
      valor: formatarValor(saldo),
      icon: 'wallet',
      color: saldo >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
      bg: saldo >= 0 ? 'var(--color-success-light)' : 'var(--color-danger-light)',
    },
    {
      label: 'Receitas',
      valor: formatarValor(totalReceitas),
      icon: 'trendingUp',
      color: 'var(--color-success)',
      bg: 'var(--color-success-light)',
    },
    {
      label: 'Despesas',
      valor: formatarValor(totalDespesas),
      icon: 'trendingDown',
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-light)',
    },
    {
      label: 'Pendentes',
      valor: formatarValor(pendentes),
      icon: 'receipt',
      color: 'var(--color-warning)',
      bg: 'var(--color-warning-light)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-5)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: card.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name={card.icon} size={20} color={card.color} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              {card.label}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: card.color,
              }}
            >
              {card.valor}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
