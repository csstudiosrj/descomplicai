// Dashboard principal do casal — visão geral do planejamento
// Protegido: redireciona para /memorial se não logado ou sem assinatura ativa
// Dependências diretas: React, next/head, next/router, useAuth, Header, Card, Badge

import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/ui/Header';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const MENU = [
  { href: '/painel/fornecedores', label: 'Fornecedores', status: 'default' },
  { href: '/painel/financeiro', label: 'Financeiro', status: 'warning' },
  { href: '/painel/convidados', label: 'Convidados', status: 'default' },
  { href: '/painel/checklist', label: 'Checklist', status: 'success' },
  { href: '/painel/cronograma', label: 'Cronograma', status: 'default' },
];

export default function PainelPage() {
  const router = useRouter();
  const { usuario, logout, carregando, assinaturaAtiva } = useAuth();

  useEffect(() => {
    if (!carregando) {
      if (!usuario || !assinaturaAtiva) {
        router.replace('/memorial');
      }
    }
  }, [carregando, usuario, assinaturaAtiva, router]);

  if (carregando || !usuario || !assinaturaAtiva) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-muted)',
        backgroundColor: 'var(--color-off-white)',
      }}>
        Verificando acesso...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Painel — Descomplicaí</title>
      </Head>

      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)' }}>
        <Header logoSize="md">
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            {usuario?.email}
          </span>
          <button
            onClick={logout}
            style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sair
          </button>
        </Header>

        <main style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>
            Painel
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {MENU.map((item) => (
              <Link key={item.href} href={item.href} legacyBehavior>
                <a style={{ textDecoration: 'none' }}>
                  <Card variant="elevated" padding="lg" interactive>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
                        {item.label}
                      </span>
                      <Badge variant={item.status} size="sm" pill />
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                      Gerenciar {item.label.toLowerCase()}
                    </span>
                  </Card>
                </a>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: 'var(--space-8)' }}>
            <Link href="/memorial" legacyBehavior>
              <a style={{ textDecoration: 'none' }}>
                <Card variant="outlined" padding="md" interactive>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)', color: 'var(--color-brand)' }}>
                    Continuar meu memorial
                  </span>
                </Card>
              </a>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}