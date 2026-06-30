import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Icon from '../components/ui/Icon';
import Logo from '../components/ui/Logo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br';
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export default function LandingPage() {
  const router = useRouter();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownAberto && !e.target.closest('.dropdown-profissionais')) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownAberto]);

  const scrollToMemorial = () => {
    router.push('/memorial');
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Descomplicai',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`,
        },
        description:
          'Plataforma completa para planejamento de casamentos. Organize fornecedores, convidados, cronograma e muito mais.',
        sameAs: [
          'https://instagram.com/descomplicai',
          'https://facebook.com/descomplicai',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Descomplicai',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/vitrine?busca={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Descomplicai — Planeje seu casamento sem estresse</title>
        <meta
          name="description"
          content="Organize seu casamento em um so lugar: fornecedores, convidados, cronograma, checklist e muito mais. Descomplicai torna o planejamento do seu grande dia simples e divertido."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Descomplicai — Planeje seu casamento sem estresse" />
        <meta
          property="og:description"
          content="Organize seu casamento em um so lugar: fornecedores, convidados, cronograma, checklist e muito mais."
        />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Descomplicai" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Descomplicai — Planeje seu casamento sem estresse" />
        <meta
          name="twitter:description"
          content="Organize seu casamento em um so lugar: fornecedores, convidados, cronograma, checklist e muito mais."
        />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-white">
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/vitrine" className="text-sm font-medium text-gray-700 hover:text-amber-600 transition">
                Vitrine
              </Link>
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-amber-600 transition">
                Entrar
              </Link>
              <button
                onClick={scrollToMemorial}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Comecar agora
              </button>
            </div>
          </div>
        </nav>

        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Porque casar e pra ser lembrado,{' '}
              <span className="text-amber-600">nao sofrido.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Organize tudo em um so lugar: fornecedores, convidados, cronograma e muito mais.
            </p>
            <button
              onClick={scrollToMemorial}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg shadow-amber-500/25"
            >
              Criar meu memorial
            </button>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Tudo que voce precisa</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: 'checklist', title: 'Checklist inteligente', desc: 'Acompanhe cada etapa do planejamento' },
                { icon: 'fornecedores', title: 'Fornecedores', desc: 'Organize orcamentos e contratos' },
                { icon: 'convidados', title: 'Lista de convidados', desc: 'Controle confirmacoes e mesas' },
                { icon: 'financeiro', title: 'Financeiro', desc: 'Gerencie pagamentos e saldos' },
              ].map((f) => (
                <div key={f.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon name={f.icon} className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Voce tambem pode crescer com a gente</h2>
            <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="briefcase" className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fornecedor</h3>
              <p className="text-gray-600 mb-6">
                Seja encontrado por casais que estao planejando o casamento. Aumente sua visibilidade e receba novos leads.
              </p>
              <Link
                href="/fornecedor/cadastro"
                className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Cadastrar como fornecedor
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
