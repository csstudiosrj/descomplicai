// Perfil público do fornecedor — dados e portfólio
// Dependências diretas: React, next/head

import React from 'react';
import Head from 'next/head';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function FornecedorPerfilPage() {
  return (
    <>
      <Head><title>Perfil do Fornecedor — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ height: '200px', background: 'linear-gradient(135deg, var(--color-brand-lighter) 0%, var(--color-brand-light) 100%)' }} />
        <div style={{ maxWidth: '800px', margin: '-60px auto 0', padding: '0 var(--space-4) var(--space-8)' }}>
          <Card variant="elevated" padding="lg">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
                  Espaço Villa Real
                </h1>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                  <Badge variant="primary">Espaço</Badge>
                  <Badge variant="default">Rio de Janeiro</Badge>
                  <Badge variant="success">Verificado</Badge>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                  Espaço sofisticado para casamentos e eventos sociais. Capacidade para até 300 convidados, com jardim externo e salão principal climatizado.
                </p>
              </div>
            </div>
          </Card>

          <div style={{ marginTop: 'var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Card variant="flat" padding="md">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Capacidade</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>300</div>
            </Card>
            <Card variant="flat" padding="md">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Investimento</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>R$ 15.000</div>
            </Card>
            <Card variant="flat" padding="md">
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Avaliações</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text-primary)' }}>4.9</div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}