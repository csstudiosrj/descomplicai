import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://descomplicai.com.br';
const OG_IMAGE = `${SITE_URL}/og-vitrine.jpg`;

export default function Vitrine() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState('');
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 12;

  useEffect(() => {
    fetchFornecedores();
  }, [categoria, busca, page]);

  async function fetchFornecedores() {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (busca) params.append('busca', busca);
    params.append('page', String(page));
    params.append('limit', String(limit));

    try {
      const res = await fetch(`/api/vitrine?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setFornecedores(data.fornecedores);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Erro ao carregar vitrine:', err);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / limit);

  const pageTitle = categoria
    ? `Vitrine de ${categoria.charAt(0).toUpperCase() + categoria.slice(1)} — Descomplicaí`
    : 'Vitrine de Fornecedores — Encontre os melhores profissionais | Descomplicaí';

  const pageDescription = categoria
    ? `Encontre os melhores fornecedores de ${categoria} para seu casamento. Compare avaliações, portfólio e solicite orçamentos.`
    : 'Encontre os melhores fornecedores para seu casamento: buffet, fotografia, música, decoração e muito mais. Compare avaliações e solicite orçamentos.';

  const canonicalUrl = `${SITE_URL}/vitrine`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Vitrine de Fornecedores — Descomplicaí',
    description: pageDescription,
    url: `${SITE_URL}/vitrine`,
    itemListElement: fornecedores.map((f, index) => ({
      '@type': 'ListItem',
      position: index + 1 + (page - 1) * limit,
      item: {
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/vitrine/${f.id}`,
        name: f.nome_fantasia || f.nome_empresa || f.nome,
        description: f.descricao || `${f.categoria} — ${f.subcategoria || ''}`,
        url: `${SITE_URL}/vitrine/${f.id}`,
        image: f.logo_url || (f.fotos && f.fotos[0]) || undefined,
        address: f.cidade
          ? {
              '@type': 'PostalAddress',
              addressLocality: f.cidade,
              addressRegion: f.estado,
              addressCountry: 'BR',
            }
          : undefined,
        aggregateRating:
          f.media_avaliacao > 0
            ? {
                '@type': 'AggregateRating',
                ratingValue: f.media_avaliacao,
                reviewCount: f.total_avaliacoes,
              }
            : undefined,
      },
    })),
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`${SITE_URL}/vitrine`} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Descomplicaí" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm py-6">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-800">Vitrine de Fornecedores</h1>
            <p className="text-gray-500 mt-1">Encontre os melhores profissionais para o seu grande dia</p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPage(1); }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
            <select
              value={categoria}
              onChange={(e) => { setCategoria(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Todas as categorias</option>
              <option value="buffet">Buffet</option>
              <option value="fotografia">Fotografia</option>
              <option value="musica">Música / DJ</option>
              <option value="decoracao">Decoração</option>
              <option value="vestuario">Vestuário</option>
              <option value="beleza">Beleza</option>
              <option value="transporte">Transporte</option>
              <option value="cerimonial">Cerimonial</option>
              <option value="video">Vídeo / Filmagem</option>
              <option value="floricultura">Floricultura</option>
              <option value="papelaria">Papelaria</option>
              <option value="bar">Bar / Drinks</option>
              <option value="iluminacao">Iluminação</option>
              <option value="animacao">Animação</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">Carregando fornecedores...</p>
            </div>
          ) : fornecedores.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Nenhum fornecedor encontrado.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fornecedores.map((f) => (
                <Link
                  key={f.id}
                  href={`/vitrine/${f.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group"
                >
                  <div className="h-40 bg-gray-100 flex items-center justify-center group-hover:bg-gray-50 transition">
                    {f.logo_url || (f.fotos && f.fotos[0]) ? (
                      <img
                        src={f.logo_url || f.fotos[0]}
                        alt={f.nome_fantasia || f.nome_empresa || f.nome}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-gray-300">
                        {f.nome_fantasia?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-amber-600 transition">
                      {f.nome_fantasia || f.nome_empresa || f.nome}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {f.categoria} {f.subcategoria ? `— ${f.subcategoria}` : ''}
                    </p>
                    {f.descricao && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{f.descricao}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {f.cidade && (
                        <span>📍 {f.cidade}{f.estado ? `, ${f.estado}` : ''}</span>
                      )}
                      {f.media_avaliacao > 0 && (
                        <span>⭐ {f.media_avaliacao.toFixed(1)} ({f.total_avaliacoes})</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-medium transition ${
                    page === i + 1
                      ? 'bg-amber-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
