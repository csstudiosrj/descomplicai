// pages/vitrine/[id].jsx
// Vitrine publica do fornecedor — SEO otimizado com Schema.org LocalBusiness

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/ui/Icon';
import ContatoCard from '../../components/vitrine/ContatoCard';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br';

function formatarTelefoneParcial(telefone) {
  if (!telefone) return null;
  const limpo = telefone.replace(/\D/g, '');
  if (limpo.length < 10) return telefone;
  const ddd = limpo.slice(0, 2);
  const prefixo = limpo.slice(2, 3);
  return `(${ddd}) ${prefixo}****-****`;
}

function formatarAvaliacao(media, total) {
  const estrelas = Math.round(media || 0);
  return { estrelas, total: total || 0 };
}

export default function VitrineFornecedor({ fornecedor: initialData, error: serverError }) {
  const router = useRouter();
  const { id } = router.query;

  const [fornecedor, setFornecedor] = useState(initialData);
  const [loading, setLoading] = useState(!initialData && !serverError);
  const [error, setError] = useState(serverError || null);
  const [user, setUser] = useState(null);
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false);
  const [mostrarFormOrcamento, setMostrarFormOrcamento] = useState(false);
  const [formOrcamento, setFormOrcamento] = useState({
    nome_lead: '',
    email: '',
    telefone: '',
    tipo_evento: '',
    data_prevista: '',
    notas: '',
  });
  const [enviandoOrcamento, setEnviandoOrcamento] = useState(false);
  const [sucessoOrcamento, setSucessoOrcamento] = useState(false);
  const [erroOrcamento, setErroOrcamento] = useState('');

  useEffect(() => {
    async function verificarUsuario() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: evento } = await supabase
          .from('eventos')
          .select('assinatura_ativa')
          .eq('usuario_id', session.user.id)
          .order('criado_em', { ascending: false })
          .limit(1)
          .single();
        if (evento?.assinatura_ativa) setAssinaturaAtiva(true);
      }
    }
    verificarUsuario();
  }, []);

  useEffect(() => {
    if (initialData || serverError || !id) return;
    async function buscarFornecedor() {
      try {
        const { data, error } = await supabase
          .from('fornecedores')
          .select('*')
          .eq('id', id)
          .eq('status', 'aprovado')
          .single();
        if (error || !data) throw new Error('Fornecedor nao encontrado');
        setFornecedor(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    buscarFornecedor();
  }, [id, initialData, serverError]);

  async function enviarOrcamento(e) {
    e.preventDefault();
    setErroOrcamento('');
    if (!formOrcamento.nome_lead || !formOrcamento.email || !formOrcamento.tipo_evento) {
      setErroOrcamento('Preencha nome, e-mail e tipo de evento.');
      return;
    }
    setEnviandoOrcamento(true);
    try {
      const res = await fetch('/api/vitrine/orcamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fornecedor_id: id, ...formOrcamento }),
      });
      if (!res.ok) throw new Error('Erro ao enviar orcamento');
      setSucessoOrcamento(true);
      setFormOrcamento({ nome_lead: '', email: '', telefone: '', tipo_evento: '', data_prevista: '', notas: '' });
    } catch (err) {
      setErroOrcamento(err.message);
    } finally {
      setEnviandoOrcamento(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !fornecedor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Fornecedor nao encontrado</h1>
          <p className="text-gray-500">O fornecedor que voce procura nao esta disponivel no momento.</p>
          <button
            onClick={() => router.push('/vitrine')}
            className="mt-6 text-amber-600 hover:text-amber-700 font-medium"
          >
            ← Voltar para vitrine
          </button>
        </div>
      </div>
    );
  }

  const f = fornecedor;
  const nome = f.nome_fantasia || f.nome_empresa || f.nome;
  const { estrelas, total } = formatarAvaliacao(f.media_avaliacao, f.total_avaliacoes);
  const isLogado = !!user;
  const isPublico = !user;
  const isAssinante = isLogado && assinaturaAtiva;
  const telefoneCompleto = f.telefone;
  const telefoneParcial = formatarTelefoneParcial(f.telefone);
  const portfolio = f.portfolio_urls || f.fotos || [];

  const pageTitle = `${nome} — ${f.categoria} em ${f.cidade || 'Brasil'} | Descomplicai`;
  const pageDescription = f.descricao
    ? `${f.descricao.slice(0, 155)}${f.descricao.length > 155 ? '...' : ''}`
    : `Encontre ${nome}, fornecedor de ${f.categoria} para seu casamento. Veja avaliacoes, portfolio e solicite orcamento.`;
  const canonicalUrl = `${SITE_URL}/vitrine/${f.id}`;
  const ogImage = f.logo_url || (portfolio[0]) || `${SITE_URL}/og-vitrine.jpg`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/vitrine/${f.id}`,
    name: nome,
    description: f.descricao || `${f.categoria} — ${f.subcategoria || ''}`,
    url: canonicalUrl,
    image: ogImage,
    telephone: f.telefone || undefined,
    email: f.email || undefined,
    address: f.cidade
      ? {
          '@type': 'PostalAddress',
          addressLocality: f.cidade,
          addressRegion: f.estado,
          addressCountry: 'BR',
        }
      : undefined,
    priceRange: f.plano === 'premium' ? '$$$$' : f.plano === 'vip' ? '$$$$$' : '$$',
    aggregateRating:
      f.media_avaliacao > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: f.media_avaliacao,
            reviewCount: f.total_avaliacoes,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    areaServed: f.regiao_atuacao || f.cidade || 'Brasil',
    serviceType: f.categoria,
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <meta property="og:type" content="profile" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Descomplicai" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <button
              onClick={() => router.push('/vitrine')}
              className="text-sm text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-1"
            >
              <Icon name="arrowLeft" className="w-4 h-4" /> Vitrine
            </button>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                {f.logo_url ? (
                  <Image
                    src={f.logo_url}
                    alt={nome}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-gray-300">{nome.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{nome}</h1>
                <p className="text-gray-500 mt-1">
                  {f.categoria} {f.subcategoria ? `— ${f.subcategoria}` : ''}
                  {f.cidade && ` • ${f.cidade}${f.estado ? `, ${f.estado}` : ''}`}
                </p>
                {f.media_avaliacao > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Icon
                        key={i}
                        name={i < estrelas ? 'star' : 'starOutline'}
                        className={`w-4 h-4 ${i < estrelas ? 'text-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      {f.media_avaliacao.toFixed(1)} ({total} avaliacoes)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {f.bio && (
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-2">Sobre</h2>
              <p className="text-gray-600 leading-relaxed">{f.bio}</p>
            </div>
          )}

          {portfolio.length > 0 && (
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {portfolio.map((url, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                    <Image
                      src={url}
                      alt={`Portfolio ${nome} — ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Contato</h2>
            <div className="space-y-3">
              {isAssinante && telefoneCompleto && (
                <ContatoCard tipo="telefone" valor={telefoneCompleto} />
              )}
              {isAssinante && f.email && (
                <ContatoCard tipo="email" valor={f.email} />
              )}
              {isAssinante && f.instagram && (
                <ContatoCard tipo="instagram" valor={f.instagram} />
              )}
              {isAssinante && f.site && (
                <ContatoCard tipo="site" valor={f.site} />
              )}
              {(isPublico || (isLogado && !isAssinante)) && telefoneParcial && (
                <div className="flex items-center gap-3 text-gray-500">
                  <Icon name="phone" className="w-5 h-5" />
                  <span>{telefoneParcial}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">assinante</span>
                </div>
              )}
              {!isAssinante && !telefoneParcial && !f.email && !f.instagram && !f.site && (
                <p className="text-gray-500 text-sm">Dados de contato disponiveis para assinantes.</p>
              )}
            </div>
          </div>

          {isLogado && !isAssinante && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-amber-900 mb-2">Desbloqueie o contato completo</h3>
              <p className="text-amber-800 text-sm mb-4">
                Assine o Descomplicai Pro para ver telefone, Instagram e site completos de todos os fornecedores.
              </p>
              <button
                onClick={() => router.push('/painel/financeiro')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Ver planos
              </button>
            </div>
          )}

          {isPublico && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Crie sua conta gratuita</h3>
              <p className="text-gray-600 text-sm mb-4">
                Cadastre-se no Descomplicai para ver dados de contato e solicitar orcamentos de fornecedores.
              </p>
              <button
                onClick={() => router.push('/cadastro')}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Criar conta
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Solicitar orcamento</h2>
            <p className="text-gray-500 text-sm mb-4">
              Preencha seus dados e {nome} entrara em contato.
            </p>
            {sucessoOrcamento ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                ✅ Orcamento enviado com sucesso! {nome} entrara em contato em breve.
              </div>
            ) : (
              <form onSubmit={enviarOrcamento} className="space-y-4">
                <input type="text" placeholder="Nome completo" value={formOrcamento.nome_lead}
                  onChange={(e) => setFormOrcamento(p => ({ ...p, nome_lead: e.target.value }))}
                  required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
                <input type="email" placeholder="E-mail" value={formOrcamento.email}
                  onChange={(e) => setFormOrcamento(p => ({ ...p, email: e.target.value }))}
                  required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
                <input type="tel" placeholder="Telefone" value={formOrcamento.telefone}
                  onChange={(e) => setFormOrcamento(p => ({ ...p, telefone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
                <input type="text" placeholder="Tipo de evento" value={formOrcamento.tipo_evento}
                  onChange={(e) => setFormOrcamento(p => ({ ...p, tipo_evento: e.target.value }))}
                  required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
                <input type="date" placeholder="Data prevista" value={formOrcamento.data_prevista}
                  onChange={(e) => setFormOrcamento(p => ({ ...p, data_prevista: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
                <textarea placeholder="Detalhes adicionais" value={formOrcamento.notas}
                  onChange={(e) => setFormOrcamento(p => ({ ...p, notas: e.target.value }))}
                  rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent" />
                {erroOrcamento && <p className="text-red-600 text-sm">{erroOrcamento}</p>}
                <button type="submit" disabled={enviandoOrcamento}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-50">
                  {enviandoOrcamento ? 'Enviando...' : 'Enviar orcamento'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params, req }) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data, error } = await supabaseAdmin
      .from('fornecedores')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'aprovado')
      .single();

    if (error || !data) {
      return { props: { fornecedor: null, error: 'Fornecedor nao encontrado' } };
    }

    return { props: { fornecedor: data, error: null } };
  } catch (err) {
    return { props: { fornecedor: null, error: err.message } };
  }
}
