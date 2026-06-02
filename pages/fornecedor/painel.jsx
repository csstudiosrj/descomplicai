// Painel administrativo do fornecedor — leads e configurações
// Dependências diretas: React, next/head

import React from 'react';
import Head from 'next/head';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const LEADS = [
  { id: 1, casal: 'Ana e Pedro', data: '2026-12-15', cidade: 'Rio de Janeiro', status: 'novo', orcamento: '50k-90k' },
  { id: 2, casal: 'Mariana e Lucas', data: '2027-03-20', cidade: 'São Paulo', status: 'contatado', orcamento: '20k-50k' },
];

const STATUS_BADGE = {
  novo: 'primary',
  contatado: 'warning',
  fechado: 'success',
  perdido: 'danger',
};

export default function FornecedorPainelPage() {
  return (
    <>
      <Head><title>Painel do Fornecedor — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' }}>
        <header style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>Painel do Fornecedor</h1>
          <Badge variant="success" size="md" pill>Online</Badge>
        </header>

        <main style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <Card variant="elevated" padding="lg">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Leads este mês</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>12</div>
            </Card>
            <Card variant="elevated" padding="lg">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Conversão</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-success)' }}>25%</div>
            </Card>
            <Card variant="elevated" padding="lg">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Faturamento</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-brand)' }}>R$ 45k</div>
            </Card>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Leads recentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {LEADS.map((l) => (
              <Card key={l.id} variant="default" padding="md" interactive>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>{l.casal}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      {l.cidade} · {l.data} · Orçamento: {l.orcamento}
                    </div>
                  </div>
                  <Badge variant={STATUS_BADGE[l.status]} size="sm" pill>{l.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}