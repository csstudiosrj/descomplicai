// Controle financeiro — orçamento, pagamentos e saldo
// Dependências diretas: React, next/head

import React, { useState } from 'react';
import Head from 'next/head';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function FinanceiroPage() {
  const [orcamentoTotal, setOrcamentoTotal] = useState(50000);
  const [despesas, setDespesas] = useState([
    { id: 1, item: 'Espaço', valor: 15000, pago: true, categoria: 'Local' },
    { id: 2, item: 'Buffet', valor: 12000, pago: false, categoria: 'Alimentação' },
    { id: 3, item: 'Fotografia', valor: 4000, pago: false, categoria: 'Serviços' },
  ]);
  const [novoItem, setNovoItem] = useState('');
  const [novoValor, setNovoValor] = useState('');

  const totalGasto = despesas.reduce((acc, d) => acc + d.valor, 0);
  const totalPago = despesas.filter((d) => d.pago).reduce((acc, d) => acc + d.valor, 0);
  const percentual = orcamentoTotal > 0 ? (totalGasto / orcamentoTotal) * 100 : 0;

  const adicionar = (e) => {
    e.preventDefault();
    if (!novoItem || !novoValor) return;
    setDespesas([...despesas, { id: Date.now(), item: novoItem, valor: Number(novoValor), pago: false, categoria: 'Outros' }]);
    setNovoItem('');
    setNovoValor('');
  };

  const togglePago = (id) => {
    setDespesas(despesas.map((d) => d.id === id ? { ...d, pago: !d.pago } : d));
  };

  return (
    <>
      <Head><title>Financeiro — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-6) var(--space-4)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>Financeiro</h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <Card variant="elevated" padding="lg">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Orçamento total</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>R$ {orcamentoTotal.toLocaleString('pt-BR')}</div>
            </Card>
            <Card variant="elevated" padding="lg">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Total gasto</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-danger)' }}>R$ {totalGasto.toLocaleString('pt-BR')}</div>
            </Card>
            <Card variant="elevated" padding="lg">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Pago</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-success)' }}>R$ {totalPago.toLocaleString('pt-BR')}</div>
            </Card>
          </div>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-border)', overflow: 'hidden', marginBottom: 'var(--space-2)' }}>
              <div style={{ width: `${Math.min(percentual, 100)}%`, height: '100%', backgroundColor: percentual > 100 ? 'var(--color-danger)' : 'var(--color-brand)', transition: 'width 400ms ease' }} />
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'right' }}>
              {percentual.toFixed(1)}% do orçamento utilizado
            </div>
          </div>

          <form onSubmit={adicionar} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '200px' }}>
              <Input placeholder="Item (ex: Decoração)" value={novoItem} onChange={(e) => setNovoItem(e.target.value)} />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <Input type="number" placeholder="Valor R$" value={novoValor} onChange={(e) => setNovoValor(e.target.value)} />
            </div>
            <Button type="submit" variant="primary">Adicionar</Button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {despesas.map((d) => (
              <Card key={d.id} variant="default" padding="md" interactive onClick={() => togglePago(d.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-sm)', border: `2px solid ${d.pago ? 'var(--color-success)' : 'var(--color-border-strong)'}`, backgroundColor: d.pago ? 'var(--color-success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {d.pago && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-medium)', color: 'var(--color-text-primary)' }}>{d.item}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{d.categoria}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                    R$ {d.valor.toLocaleString('pt-BR')}
                  </div>
                  <Badge variant={d.pago ? 'success' : 'warning'} size="sm">{d.pago ? 'Pago' : 'Pendente'}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}