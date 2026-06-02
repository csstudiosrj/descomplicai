// Painel administrativo do sistema
// Dependências diretas: React, next/head

import React from 'react';
import Head from 'next/head';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function AdminPage() {
  return (
    <>
      <Head><title>Admin — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' }}>
        <header style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>Administração</h1>
        </header>

        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            <Card variant="elevated" padding="lg">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Usuários</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>1.247</div>
            </Card>
            <Card variant="elevated" padding="lg">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Memoriais criados</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-brand)' }}>892</div>
            </Card>
            <Card variant="elevated" padding="lg">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Fornecedores</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-success)' }}>156</div>
            </Card>
            <Card variant="elevated" padding="lg">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Assinantes</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-info)' }}>342</div>
            </Card>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Atividade recente</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { acao: 'Novo memorial criado', usuario: 'Ana e Pedro', tempo: '2 min atrás', tipo: 'success' },
              { acao: 'Fornecedor cadastrado', usuario: 'Buffet Sabores', tempo: '15 min atrás', tipo: 'info' },
              { acao: 'Pagamento confirmado', usuario: 'Mariana e Lucas', tempo: '1h atrás', tipo: 'primary' },
            ].map((item, i) => (
              <Card key={i} variant="default" padding="md">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Badge variant={item.tipo} size="sm">{item.acao}</Badge>
                    <span style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>{item.usuario}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{item.tempo}</span>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}