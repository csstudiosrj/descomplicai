import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import fetchAPI from '../utils/fetchAPI';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br';
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  // CORREÇÃO 3: estado para tela de confirmação de email
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);
  const [emailConfirmacao, setEmailConfirmacao] = useState('');

  async function handleCadastro(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      });
      if (error) throw error;

      const session = data?.session;
      if (!session?.access_token) {
        // CORREÇÃO 3: Email não confirmado — NÃO redireciona
        // Mostra tela de confirmação com imagem de segurança
        setAguardandoConfirmacao(true);
        setEmailConfirmacao(email);
        setLoading(false);
        return;
      }

      // Verifica se veio do memorial (redirect=/memorial)
      const redirectTo = router.query.redirect;
      if (redirectTo === '/memorial') {
        // Lê estado salvo do memorial antes do cadastro
        let estadoMemorial = null;
        try {
          const raw = sessionStorage.getItem('descomplicai-pre-login-state');
          if (raw) {
            estadoMemorial = JSON.parse(raw);
          }
        } catch {
          // Ignora erro de parse
        }

        if (estadoMemorial) {
          // Cria evento + memorial no Supabase
          try {
            const res = await fetchAPI('/api/memorial/criar-evento', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ estado: estadoMemorial }),
            });

            const result = await res.json();
            if (!res.ok) {
              console.warn('[cadastro] Erro ao criar evento:', result.erro || result.error);
            } else {
              console.log('[cadastro] Evento criado:', result.evento_id);
            }
          } catch (apiErr) {
            console.warn('[cadastro] Falha na API criar-evento:', apiErr);
            // Não bloqueia o cadastro se a API falhar
          }

          // Limpa sessionStorage
          try {
            sessionStorage.removeItem('descomplicai-pre-login-state');
          } catch {}
        }
      }

      // Redireciona para o destino correto
      const destino = redirectTo || '/memorial';
      router.push(destino);
    } catch (err) {
      setErro(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // CORREÇÃO 3: Tentar novamente após confirmação de email
  async function handleVerificarConfirmacao() {
    setLoading(true);
    setErro('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        // Email confirmado! Redireciona
        const redirectTo = router.query.redirect;
        const destino = redirectTo || '/memorial';
        router.push(destino);
      } else {
        setErro('Email ainda não confirmado. Verifique sua caixa de entrada e clique no link.');
      }
    } catch (err) {
      setErro('Não foi possível verificar. Tente fazer login.');
    } finally {
      setLoading(false);
    }
  }

  // CORREÇÃO 3: Reenviar email de confirmação
  async function handleReenviarEmail() {
    setLoading(true);
    setErro('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailConfirmacao,
      });
      if (error) throw error;
      setErro('');
      alert('Email reenviado! Verifique sua caixa de entrada.');
    } catch (err) {
      setErro(err.message || 'Erro ao reenviar email. Tente novamente.');
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

  // CORREÇÃO 3: Tela de confirmação de email
  if (aguardandoConfirmacao) {
    return (
      <>
        <Head>
          <title>Confirme seu email — Descomplicaí</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>

        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-off-white)',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-6)',
          }}>
            {/* Ícone de segurança */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-2)',
            }}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                <circle cx="12" cy="16" r="1" fill="var(--color-success)" />
              </svg>
            </div>

            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)',
              }}>
                Quase lá!
              </h1>
              <p style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                fontSize: 'var(--text-base)',
              }}>
                Enviamos um link de confirmação para{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>{emailConfirmacao}</strong>.
                <br /><br />
                Clique no link do email para ativar sua conta e continuar planejando seu casamento.
              </p>
            </div>

            <div style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              width: '100%',
              textAlign: 'left',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-3)',
                textAlign: 'center',
              }}>
                Dicas:
              </p>
              <ul style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.8,
                paddingLeft: 'var(--space-5)',
                margin: 0,
              }}>
                <li>Verifique sua caixa de <strong>spam</strong> ou <strong>promoções</strong></li>
                <li>O link expira em 24 horas</li>
                <li>Se não recebeu, clique em reenviar abaixo</li>
              </ul>
            </div>

            {erro && (
              <div role="alert" style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-light)',
                color: 'var(--color-danger)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                width: '100%',
              }}>{erro}</div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              width: '100%',
            }}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onClick={handleVerificarConfirmacao}
              >
                {loading ? 'Verificando...' : 'Já confirmei meu email'}
              </Button>

              <Button
                variant="ghost"
                size="md"
                fullWidth
                loading={loading}
                onClick={handleReenviarEmail}
              >
                Reenviar email de confirmação
              </Button>
            </div>

            <p style={{
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