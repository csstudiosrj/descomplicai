import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

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
          content="Crie sua conta gratuita no Descomplicaí e comece a planejar seu casamento. Checklist, fornecedores, convidados e muito mais."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_URL}/cadastro`} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Cadastro — Descomplicaí" />
        <meta
          property="og:description"
          content="Crie sua conta gratuita e comece a planejar seu casamento hoje mesmo."
        />
        <meta property="og:url" content={`${SITE_URL}/cadastro`} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Descomplicaí" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cadastro — Descomplicaí" />
        <meta
          name="twitter:description"
          content="Crie sua conta gratuita e comece a planejar seu casamento hoje mesmo."
        />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold text-gray-900">Descomplicaí</h1>
            </Link>
            <h2 className="text-xl font-semibold text-gray-800 mt-4">Crie sua conta</h2>
            <p className="text-gray-500 mt-1">Comece a planejar seu casamento</p>
          </div>

          <form onSubmit={handleCadastro} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
              <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
            </div>
            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {erro}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
