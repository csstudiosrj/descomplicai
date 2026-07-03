import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MINUTOS = 5;
const DELAY_ENTRE_TENTATIVAS_MS = 1500;

function getBloqueioKey() {
  return 'admin_login_bloqueio';
}

function getTentativasKey() {
  return 'admin_login_tentativas';
}

function estaBloqueado() {
  if (typeof window === 'undefined') return false;
  const bloqueio = localStorage.getItem(getBloqueioKey());
  if (!bloqueio) return false;
  const expiraEm = parseInt(bloqueio, 10);
  if (Date.now() < expiraEm) return true;
  localStorage.removeItem(getBloqueioKey());
  localStorage.removeItem(getTentativasKey());
  return false;
}

function registrarTentativaFalha() {
  if (typeof window === 'undefined') return;
  const atual = parseInt(localStorage.getItem(getTentativasKey()) || '0', 10);
  const novo = atual + 1;
  localStorage.setItem(getTentativasKey(), String(novo));
  if (novo >= MAX_TENTATIVAS) {
    const expiraEm = Date.now() + BLOQUEIO_MINUTOS * 60 * 1000;
    localStorage.setItem(getBloqueioKey(), String(expiraEm));
  }
}

function limparTentativas() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getTentativasKey());
  localStorage.removeItem(getBloqueioKey());
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempoBloqueio, setTempoBloqueio] = useState(0);

  // Atualiza contador de bloqueio na UI
  useEffect(() => {
    if (!estaBloqueado()) return;
    const interval = setInterval(() => {
      const bloqueio = localStorage.getItem(getBloqueioKey());
      if (!bloqueio) {
        setTempoBloqueio(0);
        clearInterval(interval);
        return;
      }
      const restante = Math.max(0, Math.ceil((parseInt(bloqueio, 10) - Date.now()) / 1000));
      setTempoBloqueio(restante);
      if (restante <= 0) {
        localStorage.removeItem(getBloqueioKey());
        localStorage.removeItem(getTentativasKey());
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [erro]);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setErro('');

    if (estaBloqueado()) {
      setErro('Muitas tentativas. Aguarde antes de tentar novamente.');
      return;
    }

    setLoading(true);

    // Delay artificial para dificultar brute-force
    await new Promise((resolve) => setTimeout(resolve, DELAY_ENTRE_TENTATIVAS_MS));

    try {
      // 1. Login no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (authError || !authData?.user) {
        registrarTentativaFalha();
        // Mensagem generica: nunca revela se email existe, senha errada, etc.
        setErro('Credenciais invalidas ou acesso negado.');
        setLoading(false);
        return;
      }

      // 2. Verificar se e admin na tabela admins
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id')
        .eq('usuario_id', authData.user.id)
        .single();

      // Se nao for admin: signOut imediato, limpar sessao, mensagem generica
      if (adminError || !adminData) {
        await supabase.auth.signOut();
        registrarTentativaFalha();
        setErro('Credenciais invalidas ou acesso negado.');
        setLoading(false);
        return;
      }

      // 3. E admin: limpar tentativas e redirecionar
      limparTentativas();
      router.push('/admin');
    } catch (err) {
      registrarTentativaFalha();
      setErro('Erro ao processar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [email, senha, router]);

  const minutosBloqueio = Math.floor(tempoBloqueio / 60);
  const segundosBloqueio = tempoBloqueio % 60;

  return (
    <>
      <Head>
        <title>Area Administrativa</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-bg-primary, #0f172a)',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-brand, #e11d48)',
              marginBottom: 'var(--space-2)',
            }}>
              Descomplicai
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-secondary, #94a3b8)',
              fontSize: 'var(--text-sm)',
            }}>
              Area Administrativa — Acesso Restrito
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Input
              label="E-mail"
              type="email"
              placeholder="admin@descomplicai.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />

            {erro && (
              <div role="alert" style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-light, #fee2e2)',
                color: 'var(--color-danger, #dc2626)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
              }}>
                {erro}
                {tempoBloqueio > 0 && (
                  <div style={{ marginTop: 'var(--space-2)', fontWeight: 'var(--font-bold)' }}>
                    Aguarde {minutosBloqueio}:{segundosBloqueio.toString().padStart(2, '0')}
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={estaBloqueado()}
            >
              {estaBloqueado() ? 'Bloqueado temporariamente' : 'Entrar'}
            </Button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: 'var(--space-6)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted, #64748b)',
          }}>
            Acesso exclusivo para administradores do sistema.
          </p>
        </div>
      </div>
    </>
  );
}