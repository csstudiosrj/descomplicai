import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [msgRecuperacao, setMsgRecuperacao] = useState('');

  const redirect = router.query.redirect || '/painel';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setMsgRecuperacao('');
    setEnviando(true);

    const { data, error } = await login(email, senha);

    if (error) {
      setEnviando(false);
      if (error.message.includes('Invalid login credentials')) {
        setErro('Email ou senha incorretos.');
      } else if (error.message.includes('Email not confirmed')) {
        setErro('Confirme seu email antes de entrar.');
      } else {
        setErro(error.message || 'Erro ao fazer login.');
      }
      return;
    }

    if (!data?.session?.user) {
      setEnviando(false);
      setErro('Erro ao fazer login.');
      return;
    }

    const userId = data.session.user.id;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const [cerimRes, fornRes] = await Promise.all([
        supabaseClient
          .from('cerimonialistas')
          .select('id')
          .eq('usuario_id', userId)
          .single(),
        supabaseClient
          .from('fornecedores_plataforma')
          .select('id')
          .eq('usuario_id', userId)
          .single(),
      ]);

      setEnviando(false);

      if (!cerimRes.error && cerimRes.data) {
        router.push('/cerimonialista/painel');
        return;
      }

      if (!fornRes.error && fornRes.data) {
        router.push('/fornecedor/painel');
        return;
      }

      router.push(redirect);
    } catch (err) {
      setEnviando(false);
      console.error('[login] erro ao detectar tipo:', err);
      router.push(redirect);
    }
  };

  const handleRecuperarSenha = async () => {
    setErro('');
    setMsgRecuperacao('');
    if (!email) {
      setErro('Digite seu e-mail para recuperar a senha.');
      return;
    }
    const { supabase } = await import('../lib/supabase');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? window.location.origin + '/login' : undefined,
    });
    if (error) {
      setErro(error.message);
    } else {
      setMsgRecuperacao('Enviamos um link de recuperação para seu e-mail.');
    }
  };

  return (
    <>
      <Head>
        <title>Entrar — Descomplicaí</title>
        <meta name="description" content="Acesse seu memorial de casamento no Descomplicaí." />
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Senha" type="password" placeholder="Sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required />

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

            {msgRecuperacao && (
              <div role="status" style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-light)',
                color: 'var(--color-success)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
              }}>{msgRecuperacao}</div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={enviando}>Entrar</Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              <button
                type="button"
                onClick={handleRecuperarSenha}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-brand)',
                  fontWeight: 'var(--font-medium)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                Esqueci minha senha
              </button>
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Ainda não começou?{' '}
              <Link href="/" legacyBehavior>
                <a style={{ color: 'var(--color-brand)', fontWeight: 'var(--font-medium)' }}>Comece seu memorial</a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
