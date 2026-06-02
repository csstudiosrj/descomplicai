// Acesso do cerimonialista/colaborador por token único — área restrita
// Dependências diretas: React, next/router, next/head

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function ColaboradorPage() {
  const router = useRouter();
  const { token } = router.query;
  const [validando, setValidando] = useState(true);
  const [valido, setValido] = useState(false);

  useEffect(() => {
    if (!token) return;
    // Placeholder para validação real via API
    const timer = setTimeout(() => {
      setValido(token.length > 5);
      setValidando(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [token]);

  if (validando) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
        Validando acesso...
      </div>
    );
  }

  if (!valido) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card variant="outlined" padding="lg">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-danger)', marginBottom: 'var(--space-3)' }}>
            Acesso negado
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
            Este link de convite não é válido ou expirou.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head><title>Área do Colaborador — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-off-white)', padding: 'var(--space-6) var(--space-4)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)' }}>Área do Colaborador</h1>
            <Badge variant="success" size="md" pill>Acesso liberado</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            <Card variant="elevated" padding="lg" interactive>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>Cronograma do dia</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Visualize e edite a timeline do evento.</p>
            </Card>
            <Card variant="elevated" padding="lg" interactive>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>Contatos de emergência</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Acesse telefones de todos os fornecedores.</p>
            </Card>
            <Card variant="elevated" padding="lg" interactive>
              <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>Checklist ao vivo</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Marque tarefas concluídas em tempo real.</p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}