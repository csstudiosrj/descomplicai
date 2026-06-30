import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Icon from '../components/ui/Icon';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br';
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

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
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      router.push('/painel');
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
    url: `${SITE_URL}/login`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
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
        <link rel="canonical" href={`${SITE_URL}/login`} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Entrar — Descomplicaí" />
        <meta
          property="og:description"
          content="Acesse seu memorial e continue a planejar o casamento dos seus sonhos."
        />
        <meta property="og:url" content={`${SITE_URL}/login`} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Descomplicaí" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Entrar — Descomplicaí" />
        <meta
          name="twitter:description"
          content="Acesse seu memorial e continue a planejar o casamento dos seus sonhos."
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
            <p className="text-gray-500 mt-2">
              Acesse seu memorial e continue a planejar o casamento dos seus sonhos
            </p>
          </div>

          <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-5">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="Sua senha"
              />
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
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-amber-600 hover:text-amber-700 font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
