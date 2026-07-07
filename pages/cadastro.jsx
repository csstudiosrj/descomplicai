import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import fetchAPI from '../utils/fetchAPI';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://arxum.csstudios.site';
const OG_IMAGE = `${SITE_URL}/descomplicai/og-image.jpg`;

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);
  const [emailConfirmacao, setEmailConfirmacao] = useState('');

  // Pré-preenche email se veio da query (ex: /cadastro?email=xxx)
  useEffect(() => {
    if (router.query.email) {
      setEmail(router.query.email);
    }
  }, [router.query.email]);

  async function handleCadastro(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      // 1. Salva draft do memorial no Supabase (se houver estado no localStorage)
      let draftToken = null;
      try {
        const estadoRaw = localStorage.getItem('memorial_estado');
        if (estadoRaw) {
          const estado = JSON.parse(estadoRaw);
          const res = await fetchAPI('/api/memorial/salvar-draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado, email }),
          });
          const result = await res.json();
          if (result.sucesso) {
            draftToken = result.draft_token;
          }
        }
      } catch (draftErr) {
        console.warn('[cadastro] Erro ao salvar draft:', draftErr);
        // Não bloqueia o cadastro se o draft falhar
      }

      // 2. Monta o emailRedirectTo com draft_token se existir
      // URL absoluta obrigatória para o Supabase Auth — DEVE incluir /descomplicai
      const redirectTo = draftToken
        ? `${SITE_URL}/descomplicai/confirmar?draft_id=${draftToken}`
        : `${SITE_URL}/descomplicai/confirmar`;

      // 3. Cadastra no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;

      const session = data?.session;

      // Se o email não precisa de confirmação (raro, mas possível), loga direto
      if (session?.access_token) {
        await processarLoginComSessao(session);
        return;
      }

      // 4. Mostra tela de "aguardando confirmação"
      setAguardandoConfirmacao(true);
      setEmailConfirmacao(email);
      setLoading(false);
    } catch (err) {
      setErro(err.message || 'Erro ao criar conta. Tente novamente.');
      setLoading(false);
    }
  }

  async function processarLoginComSessao(session) {
    try {
      const redirectTo = router.query.redirect;

      if (redirectTo === '/memorial') {
        let estadoMemorial = null;
        try {
          const raw = localStorage.getItem('memorial_estado');
          if (raw) {
            estadoMemorial = JSON.parse(raw);
          }
        } catch {
          // ignora
        }

        if (estadoMemorial) {
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
          }

          try {
            localStorage.removeItem('memorial_estado');
          } catch {}
        }
      }

      // CORREÇÃO: basePath: '/descomplicai' já adiciona o prefixo automaticamente.
      // NUNCA incluir '/descomplicai' manualmente em router.push/Link.
      const destino = redirectTo || '/memorial';
      router.push(destino);
    } catch (err) {
      setErro('Erro ao redirecionar. Tente fazer login.');
    }
  }

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
    url: `${SITE_URL}/descomplicai/cadastro`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/descomplicai/#website`,
    },
  };

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
                <br /><br />
                <em style={{ fontSize: 'var(--text-sm)' }}>
                  Você será redirecionado automaticamente para o memorial.
                </em>
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
                <li>Pode confirmar em qualquer dispositivo — o memorial será restaurado automaticamente</li>
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
              {/* CORREÇÃO: basePath: '/descomplicai' já adiciona o prefixo automaticamente.
                  NUNCA incluir '/descomplicai' manualmente em router.push/Link. */}
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
        <link rel="canonical" href={`${SITE_URL}/descomplicai/cadastro`} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Cadastro — Descomplicaí" />
        <meta property="og:description" content="Crie sua conta gratuita e comece a planejar seu casamento hoje mesmo." />
        <meta property="og:url" content={`${SITE_URL}/descomplicai/cadastro`} />
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
            {/* CORREÇÃO: basePath: '/descomplicai' já adiciona o prefixo automaticamente.
                NUNCA incluir '/descomplicai' manualmente em router.push/Link. */}
            <Link href="/login" legacyBehavior>
              <a style={{ color: 'var(--color-brand)', fontWeight: 'var(--font-medium)' }}>Entrar</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
