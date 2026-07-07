import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://arxum.csstudios.site';
const OG_IMAGE = `${SITE_URL}/descomplicai/og-image.jpg`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;

      const session = data?.session;
      if (!session?.access_token) {
        throw new Error('Sessao nao iniciada');
      }

      // Redireciona para o destino correto
      // CORREÇÃO: basePath: '/descomplicai' já adiciona o prefixo automaticamente.
      // NUNCA incluir '/descomplicai' manualmente em router.push/Link.
      const redirectTo = router.query.redirect;
      const destino = redirectTo || '/painel';
      router.push(destino);
    } catch (err) {
      setErro(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Entrar — Descomplicaí',
    description: 'Acesse seu memorial e continue a planejar o casamento dos seus sonhos.',
    url: `${SITE_URL}/descomplicai/login`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/descomplicai/#website`,
    },
  };

  return (
    <>
      <Head>
        <title>Entrar — Descomplicaí</title>
        <meta
          name="description"
          content="Acesse seu memorial e continue a planejar o casamento dos seus sonhos. Login seguro e rápido."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_URL}/descomplicai/login`} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Entrar — Descomplicaí" />
        <meta property="og:description" content="Acesse seu memorial e continue a planejar o casamento dos seus sonhos." />
        <meta property="og:url" content={`${SITE_URL}/descomplicai/login`} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Descomplicaí" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Entrar — Descomplicaí" />
        <meta name="twitter:description" content="Acesse seu memorial e continue a planejar o casamento dos seus sonhos." />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-off-white)',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}>
              Descomplicaí
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
            }}>
              Acesse seu memorial e continue a planejar o casamento dos seus sonhos
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            {erro && (
              <div role="alert" style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-light)',
                color: 'var(--color-danger)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
              }}>{erro}</div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Entrar
            </Button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: 'var(--space-6)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}>
            Não tem conta?{' '}
            {/* CORREÇÃO: basePath: '/descomplicai' já adiciona o prefixo automaticamente.
                NUNCA incluir '/descomplicai' manualmente em router.push/Link. */}
            <Link href="/cadastro" legacyBehavior>
              <a style={{ color: 'var(--color-brand)', fontWeight: 'var(--font-medium)' }}>Cadastre-se</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
