import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br';
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCadastro(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      });
      if (error) throw error;
      router.push('/memorial');
    } catch (err) {
      setErro(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Cadastro — Descomplicaí',
    description: 'Crie sua conta gratuita e comece a planejar seu casamento hoje mesmo.',
    url: `${SITE_URL}/cadastro`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
    },
  };

  return (
    <>
      <Head>
        <title>Cadastro — Descomplicaí</title>
        <meta
          name="description"
          content="Crie sua conta gratuita no Descomplicaí e comece a planejar seu casamento."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_URL}/cadastro`} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Cadastro — Descomplicaí" />
        <meta property="og:description" content="Crie sua conta gratuita e comece a planejar seu casamento hoje mesmo." />
        <meta property="og:url" content={`${SITE_URL}/cadastro`} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Descomplicaí" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cadastro — Descomplicaí" />
        <meta name="twitter:description" content="Crie sua conta gratuita e comece a planejar seu casamento hoje mesmo." />
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
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)',
            }}>
              Crie sua conta
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary)',
            }}>
              Comece a planejar seu casamento
            </p>
          </div>

          <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Input
              label="Nome completo"
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
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
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              hint="Mínimo 6 caracteres"
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
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: 'var(--space-6)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}>
            Já tem conta?{' '}
            <Link href="/login" legacyBehavior>
              <a style={{ color: 'var(--color-brand)', fontWeight: 'var(--font-medium)' }}>Entrar</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
