// Cadastro de novo fornecedor no sistema
// Dependências diretas: React, next/head, Input, Button

import React, { useState } from 'react';
import Head from 'next/head';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function FornecedorCadastroPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cidade, setCidade] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder para integração real com Supabase
    setEnviado(true);
  };

  return (
    <>
      <Head><title>Cadastro de Fornecedor — Descomplicaí</title></Head>
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--color-off-white)' }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
            Seja um fornecedor
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: 'var(--space-8)' }}>
            Cadastre-se para receber leads qualificados de casamentos.
          </p>

          {enviado ? (
            <div style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Cadastro recebido!</h2>
              <p>Entraremos em contato em breve.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Input label="Nome da empresa" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <Input label="E-mail comercial" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Categoria (ex: Buffet, Fotografia)" value={categoria} onChange={(e) => setCategoria(e.target.value)} required />
              <Input label="Cidade de atuação" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Enviar cadastro
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}