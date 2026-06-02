// Autenticação — login de usuários
// Dependências diretas: React, next/router, useAuth, Input, Button

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginSocial, carregando } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const { error } = await login(email, senha);
    setEnviando(false);
    if (error) {
      setErro(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } else {
      router.push('/painel');
    }
  };

  return (
    <>
      <Head>
        <title>Entrar — Descomplicaí</title>
        <meta name="description" content="Acesse sua conta no Descomplicaí." />
      </Head>

      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
              Descomplicaí
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
              Acesse seu memorial
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
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
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            {erro && (
              <div role="alert" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
                {erro}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={enviando || carregando}>
              Entrar
            </Button>
          </form>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Button variant="secondary" size="md" fullWidth onClick={() => loginSocial('google')}>
              Entrar com Google
            </Button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Ainda não tem conta?{' '}
            <Link href="/cadastro" legacyBehavior>
              <a style={{ color: 'var(--color-brand)', fontWeight: 'var(--font-medium)' }}>Cadastre-se</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}