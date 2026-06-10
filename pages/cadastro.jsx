// pages/cadastro.jsx
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function CadastroPage() {
  const router = useRouter();
  const { cadastrar, carregando } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const redirect = router.query.redirect || '/memorial';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const { error } = await cadastrar(email, senha, { nome });
    setEnviando(false);
    if (error) {
      setErro(error.message || 'Erro ao criar conta.');
    } else {
      // Se a confirmação de email estiver desabilitada, o cadastro já cria a sessão.
      router.push(redirect);
    }
  };

  return (
    <>
      <Head>
        <title>Cadastro — Descomplicaí</title>
        <meta name="description" content="Crie sua conta no Descomplicaí." />
      </Head>

      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
              Crie sua conta
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
              Comece a planejar seu casamento
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Input label="Nome completo" type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} required hint="Mínimo 6 caracteres" />

            {erro && (
              <div role="alert" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)' }}>
                {erro}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={enviando || carregando}>
              Criar conta
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Já tem conta?{' '}
            <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} legacyBehavior>
              <a style={{ color: 'var(--color-brand)', fontWeight: 'var(--font-medium)' }}>Entrar</a>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}